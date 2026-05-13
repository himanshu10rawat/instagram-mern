import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import createNotification from "../utils/createNotification.js";
import { deleteCacheByPattern, getCache, setCache } from "../utils/cache.js";
import { addMediaJob } from "../queues/media.queue.js";
import trackAnalytics from "../utils/trackAnalytics.js";
import {
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
  getVideoThumbnailUrl,
} from "../utils/cloudinaryUrl.js";

const userPublicFields = "username fullName avatar isVerified";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

const getMediaType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid media type");
};

export const createPost = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "At least one media file is required");
  }

  if (req.files.length > 10) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Maximum 10 media files are allowed");
  }

  const uploadedMedia = await Promise.all(
    req.files.map(async (file) => {
      const uploadedFile = await uploadToCloudinary(file.buffer, "instagram/posts", "auto");

      await addMediaJob({
        type: getMediaType(file.mimetype),
        publicId: uploadedFile.public_id,
        url: uploadedFile.secure_url,
      });

      const mediaType = getMediaType(file.mimetype);

      return {
        url: uploadedFile.secure_url,
        optimizedUrl:
          mediaType === "image"
            ? getOptimizedImageUrl(uploadedFile.public_id)
            : getOptimizedVideoUrl(uploadedFile.public_id),
        thumbnailUrl:
          mediaType === "image"
            ? getOptimizedImageUrl(uploadedFile.public_id, {
                width: 400,
                height: 400,
                crop: "fill",
              })
            : getVideoThumbnailUrl(uploadedFile.public_id, {
                width: 400,
                height: 400,
                crop: "fill",
              }),
        publicId: uploadedFile.public_id,
        type: mediaType,
      };
    }),
  );

  const post = await Post.create({
    author: req.user._id,
    media: uploadedMedia,
    caption: req.body.caption || "",
    location: req.body.location || "",
    tags: req.body.tags || [],
  });

  await deleteCacheByPattern("feed:*");

  const createPost = await Post.findById(post._id).populate("author", userPublicFields);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, createPost, "Post created successfully"));
});

export const getFeedPosts = asyncHandler(async (req, res) => {
  const cacheKey = `feed:${req.user._id}:page:${req.query.page || 1}:limit:${req.query.limit || 10}`;

  const cachedFeed = await getCache(cacheKey);

  if (cachedFeed) {
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cachedFeed, "Feed posts fetched from cache"));
  }
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 30);
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id).select("following blockedUsers");

  const visibleAuthors = [...currentUser.following, req.user._id];

  const posts = await Post.find({
    author: { $in: visibleAuthors, $nin: currentUser.blockedUsers },
    isDeleted: false,
    isArchived: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const responseData = {
    posts,
    pagination: {
      page,
      limit,
      hasMore: posts.length === limit,
    },
  };

  await setCache(cacheKey, responseData, 60);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, responseData, "Feed posts fetched successfully"));
});

export const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false,
  }).populate("author", userPublicFields);

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  await trackAnalytics({
    owner: post.author._id || post.author,
    viewer: req.user._id,
    type: "post_impression",
    post: post._id,
    source: req.query.source || "direct",
    ip: req.ip,
    device: req.headers["user-agent"] || "",
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, post, "Post fetched successfully"));
});

export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOne({
    _id: postId,
    author: req.user._id,
    isDeleted: false,
  });

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  await Promise.all(
    post.media.map((item) =>
      cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.type,
      }),
    ),
  );

  post.isDeleted = true;
  await post.save();
  await deleteCacheByPattern("feed:*");

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Post deleted successfully"));
});

export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOneAndUpdate(
    {
      _id: postId,
      isDeleted: false,
      likes: { $ne: req.user._id },
    },
    {
      $addToSet: { likes: req.user._id },
    },
    {
      new: true,
    },
  );

  if (!post) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Post not found or already liked");
  }

  await createNotification({
    sender: req.user._id,
    receiver: post.author,
    type: "like",
    post: post._id,
  });

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Post liked successfully"));
});

export const unlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  await Post.findOneAndUpdate(
    {
      _id: postId,
      isDeleted: false,
    },
    {
      $pull: { likes: req.user._id },
    },
  );

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Post unliked successfully"));
});

export const savePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOneAndUpdate(
    {
      _id: postId,
      isDeleted: false,
    },
    {
      $addToSet: { savedBy: req.user._id },
    },
    {
      new: true,
    },
  );

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Post saved successfully"));
});

export const unsavePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  await Post.findOneAndUpdate(
    {
      _id: postId,
      isDeleted: false,
    },
    {
      $pull: { savedBy: req.user._id },
    },
  );

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Post unsaved successfully"));
});

export const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text, parentComment } = req.body;

  validateObjectId(postId, "Invalid post id");

  if (parentComment) {
    validateObjectId(parentComment, "Invalid parent comment id");
  }

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false,
  });

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    text,
    parentComment: parentComment || null,
  });

  post.commentsCount += 1;
  await post.save();

  const createdComment = await Comment.findById(comment._id).populate("author", userPublicFields);

  await createNotification({
    sender: req.user._id,
    receiver: post.author,
    type: "comment",
    post: post._id,
    comment: comment._id,
  });

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, createdComment, "Comment added successfully"));
});

export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const comments = await Comment.find({
    post: postId,
    parentComment: null,
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, comments, "Comments fetched successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  validateObjectId(commentId, "Invalid comment id");

  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  }).populate("post");

  if (!comment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Comment not found");
  }

  const isCommentOwner = comment.author.toString() === req.user._id.toString();
  const isPostOwner = comment.post.author.toString() === req.user._id.toString();

  if (!isCommentOwner && !isPostOwner) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot delete this comment");
  }

  comment.isDeleted = true;
  await comment.save();

  await Post.findByIdAndUpdate(comment.post._id, {
    $inc: { commentsCount: -1 },
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Comment deleted successfully"));
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  const posts = await Post.find({
    author: userId,
    isDeleted: false,
    isArchived: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, posts, "User posts fetched successfully"));
});

export const getMySavedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    savedBy: req.user._id,
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, posts, "Saved posts fetched successfully"));
});

export const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const updates = {};

  if (req.body.caption !== undefined) {
    updates.caption = req.body.caption;
  }

  if (req.body.location !== undefined) {
    updates.location = req.body.location;
  }

  if (req.body.tags !== undefined) {
    updates.tags = req.body.tags;
  }

  const post = await Post.findOneAndUpdate(
    {
      _id: postId,
      author: req.user._id,
      isDeleted: false,
    },
    updates,
    {
      new: true,
      runValidators: true,
    },
  ).populate("author", userPublicFields);

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, post, "Post updated successfully"));
});

export const archivePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOneAndUpdate(
    {
      _id: postId,
      author: req.user._id,
      isDeleted: false,
      isArchived: false,
    },
    {
      isArchived: true,
    },
    {
      new: true,
    },
  );

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Post archived successfully"));
});

export const unarchivePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOneAndUpdate(
    {
      _id: postId,
      author: req.user._id,
      isDeleted: false,
      isArchived: true,
    },
    {
      isArchived: false,
    },
    {
      new: true,
    },
  );

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Archived post not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Post unarchived successfully"));
});

export const getMyArchivedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.user._id,
    isDeleted: false,
    isArchived: true,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, posts, "Archived posts fetched successfully"));
});

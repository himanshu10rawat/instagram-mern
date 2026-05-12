import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import Reel from "../models/reel.model.js";
import ReelComment from "../models/reelComment.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { addMediaJob } from "../queues/media.queue.js";
import { deleteCacheByPattern } from "../utils/cache.js";

const userPublicFields = "username fullName avatar isVerified";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

export const createReel = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Reel video is required");
  }

  if (!req.file.mimetype.startsWith("video/")) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Only video file is allowed for reel");
  }

  const uploadedVideo = await uploadToCloudinary(req.file.buffer, "instagram/reels", "video");

  await addMediaJob({
    type: "video",
    publicId: uploadedVideo.public_id,
    url: uploadedVideo.secure_url,
  });

  const reel = await Reel.create({
    author: req.user._id,
    video: {
      url: uploadedVideo.secure_url,
      publicId: uploadedVideo.public_id,
    },
    caption: req.body.caption || "",
    hashtags: req.body.hashtags || [],
    audioName: req.body.audioName || "Original Audio",
    location: req.body.location || "",
  });

  const createdReel = await Reel.findById(reel._id).populate("author", userPublicFields);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, createdReel, "Reel created successfully"));
});

export const getReelsFeed = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 30);
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id).select("blockedUsers");

  const reels = await Reel.find({
    author: { $nin: currentUser.blockedUsers },
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1, viewsCount: -1 })
    .skip(skip)
    .limit(limit);

  res.status(HTTP_STATUS.Ok).json(
    new ApiResponse(
      HTTP_STATUS.Ok,
      {
        reels,
        pagination: {
          page,
          limit,
          hasMore: reels.length === limit,
        },
      },
      "Reels fetched successfully",
    ),
  );
});

export const getReelById = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOne({
    _id: reelId,
    isDeleted: false,
  }).populate("author", userPublicFields);

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, reel, "Reel fetched successfully"));
});

export const getUserReels = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  const reels = await Reel.find({
    author: userId,
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, reels, "User reels fetched successfully"));
});

export const updateReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const updates = {};

  if (req.body.caption !== undefined) updates.caption = req.body.caption;
  if (req.body.audioName !== undefined) updates.audioName = req.body.audioName;
  if (req.body.location !== undefined) updates.location = req.body.location;
  if (req.body.hashtags !== undefined) updates.hashtags = req.body.hashtags;

  const reel = await Reel.findOneAndUpdate(
    {
      _id: reelId,
      author: req.user._id,
      isDeleted: false,
    },
    updates,
    {
      new: true,
      runValidators: true,
    },
  ).populate("author", userPublicFields);

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, reel, "Reel updated successfully"));
});

export const deleteReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOne({
    _id: reelId,
    author: req.user._id,
    isDeleted: false,
  });

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  await cloudinary.uploader.destroy(reel.video.publicId, {
    resource_type: "video",
  });

  reel.isDeleted = true;
  await reel.save();

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Reel deleted successfully"));
});

export const likeReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOneAndUpdate(
    {
      _id: reelId,
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

  if (!reel) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Reel not found or already liked");
  }

  await createNotification({
    sender: req.user._id,
    receiver: reel.author,
    type: "reel_like",
    reel: reel._id,
  });

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Reel liked successfully"));
});

export const unlikeReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  await Reel.findOneAndUpdate(
    {
      _id: reelId,
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
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Reel unliked successfully"));
});

export const saveReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOneAndUpdate(
    {
      _id: reelId,
      isDeleted: false,
    },
    {
      $addToSet: { savedBy: req.user._id },
    },
    { new: true },
  );

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Reel saved successfully"));
});

export const unsaveReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  await Reel.findOneAndUpdate(
    {
      _id: reelId,
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
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Reel unsaved successfully"));
});

export const viewReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOneAndUpdate(
    {
      _id: reelId,
      isDeleted: false,
    },
    {
      $inc: { viewsCount: 1 },
    },
    {
      new: true,
    },
  );

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, { viewsCount: reel.viewsCount }, "Reel view counted"));
});

export const shareReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOneAndUpdate(
    {
      _id: reelId,
      isDeleted: false,
    },
    {
      $inc: { sharesCount: 1 },
    },
    {
      new: true,
    },
  );

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, { sharesCount: reel.sharesCount }, "Reel shared"));
});

export const addReelComment = asyncHandler(async (req, res) => {
  const { reelId } = req.params;
  const { text, parentComment } = req.body;

  validateObjectId(reelId, "Invalid reel id");

  if (parentComment) {
    validateObjectId(parentComment, "Invalid parent comment id");
  }

  const reel = await Reel.findOne({
    _id: reelId,
    isDeleted: false,
  });

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  const comment = await ReelComment.create({
    reel: reelId,
    author: req.user._id,
    text,
    parentComment: parentComment || null,
  });

  await Reel.findByIdAndUpdate(reelId, {
    $inc: { commentsCount: 1 },
  });

  const createdComment = await ReelComment.findById(comment._id).populate(
    "author",
    userPublicFields,
  );

  await createNotification({
    sender: req.user._id,
    receiver: reel.author,
    type: "reel_comment",
    reel: reel._id,
    comment: comment._id,
  });

  await deleteCacheByPattern(`recommendations:*:${req.user._id}:*`);
  await deleteCacheByPattern(`recommendations:users:${req.user._id}`);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, createdComment, "Comment added successfully"));
});

export const getReelComments = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const comments = await ReelComment.find({
    reel: reelId,
    parentComment: null,
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, comments, "Comments fetched successfully"));
});

export const deleteReelComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  validateObjectId(commentId, "Invalid comment id");

  const comment = await ReelComment.findOne({
    _id: commentId,
    isDeleted: false,
  }).populate("reel");

  if (!comment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Comment not found");
  }

  const isCommentOwner = comment.author.toString() === req.user._id.toString();
  const isReelOwner = comment.reel.author.toString() === req.user._id.toString();

  if (!isCommentOwner && !isReelOwner) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot delete this comment");
  }

  comment.isDeleted = true;
  await comment.save();

  await Reel.findByIdAndUpdate(comment.reel._id, {
    $inc: { commentsCount: -1 },
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Comment deleted successfully"));
});

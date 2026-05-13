import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import createNotification from "../utils/createNotification.js";
import { addMediaJob } from "../queues/media.queue.js";
import trackAnalytics from "../utils/trackAnalytics.js";
import {
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
  getVideoThumbnailUrl,
} from "../utils/cloudinaryUrl.js";
import { extractMentions } from "../utils/socialParser.js";

const userPublicFields = "username fullName avatar isVerified isPrivate followers closeFriends";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

const getMediaType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid media type");
};

const canViewAuthorStories = (storyAuthor, currentUserId) => {
  const currentUserIdString = currentUserId.toString();
  const isOwner = storyAuthor._id.toString() === currentUserIdString;

  if (isOwner) {
    return true;
  }

  if (!storyAuthor.isPrivate) {
    return true;
  }

  return storyAuthor.followers.some((followerId) => followerId.toString() === currentUserIdString);
};

const canViewStory = (story, storyAuthor, currentUserId) => {
  const currentUserIdString = currentUserId.toString();
  const isOwner = storyAuthor._id.toString() === currentUserIdString;

  if (isOwner) {
    return true;
  }

  if (story.visibility === "close_friends") {
    return storyAuthor.closeFriends.some((friendId) => friendId.toString() === currentUserIdString);
  }

  return canViewAuthorStories(storyAuthor, currentUserId);
};

export const createStory = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Story media is required");
  }

  const uploadedMedia = await uploadToCloudinary(req.file.buffer, "instagram/stories", "auto");

  await addMediaJob({
    type: getMediaType(req.file.mimetype),
    publicId: uploadedMedia.public_id,
    url: uploadedMedia.secure_url,
  });

  const mediaType = getMediaType(req.file.mimetype);

  const extractedMentions = extractMentions(req.body.caption || "");

  const mentionedUsers = await User.find({
    username: {
      $in: extractedMentions,
    },
    isDeleted: false,
  }).select("_id");

  const story = await Story.create({
    author: req.user._id,
    media: {
      url: uploadedMedia.secure_url,
      optimizedUrl:
        mediaType === "image"
          ? getOptimizedImageUrl(uploadedMedia.public_id)
          : getOptimizedVideoUrl(uploadedMedia.public_id),
      thumbnailUrl:
        mediaType === "image"
          ? getOptimizedImageUrl(uploadedMedia.public_id, {
              width: 400,
              height: 700,
              crop: "fill",
            })
          : getVideoThumbnailUrl(uploadedMedia.public_id, {
              width: 400,
              height: 700,
              crop: "fill",
            }),
      publicId: uploadedMedia.public_id,
      type: mediaType,
    },
    mentions: mentionedUsers.map((user) => user._id),
    caption: req.body.caption || "",
    visibility: req.body.visibility || "public",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await Promise.all(
    mentionedUsers.map((mentionedUser) =>
      createNotification({
        sender: req.user._id,
        receiver: mentionedUser._id,
        type: "mention",
        story: story._id,
      }),
    ),
  );

  const createdStory = await Story.findById(story._id).populate("author", userPublicFields);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, createdStory, "Story created successfully"));
});

export const getActiveStories = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select("following blockedUsers");

  const visibleAuthors = [...currentUser.following, req.user._id];

  const stories = await Story.find({
    author: { $in: visibleAuthors, $nin: currentUser.blockedUsers },
    expiresAt: { $gt: new Date() },
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, stories, "Stories fetched successfully"));
});

export const getUserStories = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  const storyAuthor = await User.findOne({
    _id: userId,
    isDeleted: false,
    isBlockedByAdmin: false,
  }).select(userPublicFields);

  if (!storyAuthor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (!canViewAuthorStories(storyAuthor, req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "This account is private");
  }

  const stories = await Story.find({
    author: userId,
    expiresAt: { $gt: new Date() },
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: 1 });

  const visibleStories = stories.filter((story) => canViewStory(story, story.author, req.user._id));

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, visibleStories, "User stories fetched successfully"));
});

export const viewStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    expiresAt: { $gt: new Date() },
    isDeleted: false,
  }).populate("author", userPublicFields);

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found or expired");
  }

  if (!canViewStory(story, story.author, req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot view this story");
  }

  const isOwner = story.author._id.toString() === req.user._id.toString();

  if (!isOwner) {
    const alreadyViewed = story.viewers.some(
      (viewer) => viewer.user.toString() === req.user._id.toString(),
    );

    if (!alreadyViewed) {
      story.viewers.push({
        user: req.user._id,
        viewedAt: new Date(),
      });

      await story.save();
    }
  }

  await trackAnalytics({
    owner: story.author._id || story.author,
    viewer: req.user._id,
    type: "story_impression",
    story: story._id,
    source: "story",
    ip: req.ip,
    device: req.headers["user-agent"] || "",
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, story, "Story viewed successfully"));
});

export const getStoryViewers = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    author: req.user._id,
    isDeleted: false,
  }).populate("viewers.user", "username fullName avatar isVerified");

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, story.viewers, "Story viewers fetched successfully"));
});

export const deleteStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    author: req.user._id,
    isDeleted: false,
  });

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found");
  }

  await cloudinary.uploader.destroy(story.media.publicId, {
    resource_type: story.media.type,
  });

  story.isDeleted = true;
  await story.save();

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Story deleted successfully"));
});

export const likeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    expiresAt: { $gt: new Date() },
    isDeleted: false,
  }).populate("author", userPublicFields);

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found or expired");
  }

  if (!canViewStory(story, story.author, req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot like this story");
  }

  const alreadyLiked = story.likes.some((userId) => userId.toString() === req.user._id.toString());

  if (alreadyLiked) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Story already liked");
  }

  story.likes.push(req.user._id);
  await story.save();

  await createNotification({
    sender: req.user._id,
    receiver: story.author._id,
    type: "story_like",
    story: story._id,
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Story liked successfully"));
});

export const unlikeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  await Story.findOneAndUpdate(
    {
      _id: storyId,
      expiresAt: { $gt: new Date() },
      isDeleted: false,
    },
    {
      $pull: { likes: req.user._id },
    },
  );

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Story unliked successfully"));
});

export const replyToStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { text } = req.body;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    expiresAt: { $gt: new Date() },
    isDeleted: false,
  }).populate("author", userPublicFields);

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found or expired");
  }

  if (!canViewStory(story, story.author, req.user._id)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot reply to this story");
  }

  story.replies.push({
    user: req.user._id,
    text,
    createdAt: new Date(),
  });

  await story.save();

  await createNotification({
    sender: req.user._id,
    receiver: story.author._id,
    type: "story_reply",
    story: story._id,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, null, "Story reply sent successfully"));
});

export const getStoryReplies = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    author: req.user._id,
    isDeleted: false,
  }).populate("replies.user", "username fullName avatar isVerified");

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, story.replies, "Story replies fetched successfully"));
});

export const getArchivedStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({
    author: req.user._id,
    expiresAt: {
      $lte: new Date(),
    },
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, stories, "Archived stories fetched successfully"));
});

export const archiveStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOneAndUpdate(
    {
      _id: storyId,
      author: req.user._id,
      isDeleted: false,
    },
    {
      isArchived: true,
    },
    {
      new: true,
    },
  );

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, story, "Story archived successfully"));
});

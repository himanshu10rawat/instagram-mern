import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import Report from "../models/report.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userPublicFields = "username fullName avatar bio isVerified";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

export const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  if (req.user._id.toString() === userId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot block yourself");
  }

  const targetUser = await User.findById(userId);

  if (!targetUser || targetUser.isDeleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { blockedUsers: userId },
    $pull: {
      following: userId,
      followers: userId,
      mutedUsers: userId,
      closeFriends: userId,
    },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: {
      following: req.user._id,
      followers: req.user._id,
      closeFriends: req.user._id,
    },
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "User blocked successfully"));
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { blockedUsers: userId },
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "User unblocked successfully"));
});

export const muteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  if (req.user._id.toString() === userId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot mute yourself");
  }

  const targetUser = await User.findById(userId);

  if (!targetUser || targetUser.isDeleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { mutedUsers: userId },
  });

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "User muted successfully"));
});

export const unmuteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { mutedUsers: userId },
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "User unmuted successfully"));
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("blockedUsers", userPublicFields);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user.blockedUsers, "Blocked users fetched successfully"));
});

export const getMutedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("mutedUsers", userPublicFields);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user.mutedUsers, "Muted users fetched successfully"));
});

export const reportUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason, description } = req.body;

  validateObjectId(userId, "Invalid user id");

  if (req.user._id.toString() === userId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot report yourself");
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: userId,
    type: "user",
    reason,
    description,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, report, "User reported successfully"));
});

export const reportPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { reason, description } = req.body;

  validateObjectId(postId, "Invalid post id");

  const report = await Report.create({
    reporter: req.user._id,
    post: postId,
    type: "post",
    reason,
    description,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, report, "Post reported successfully"));
});

export const reportReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;
  const { reason, description } = req.body;

  validateObjectId(reelId, "Invalid reel id");

  const report = await Report.create({
    reporter: req.user._id,
    reel: reelId,
    type: "reel",
    reason,
    description,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, report, "Reel reported successfully"));
});

export const reportComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { reason, description } = req.body;

  validateObjectId(commentId, "Invalid comment id");

  const report = await Report.create({
    reporter: req.user._id,
    comment: commentId,
    type: "comment",
    reason,
    description,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, report, "Comment reported successfully"));
});

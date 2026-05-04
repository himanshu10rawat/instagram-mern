import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
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

export const addCloseFriend = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  if (req.user._id.toString() === userId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot add yourself as close friend");
  }

  const targetUser = await User.findOne({
    _id: userId,
    isDeleted: false,
    isBlockedByAdmin: false,
  });

  if (!targetUser) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  const currentUser = await User.findById(req.user._id);

  const isFollowing = currentUser.following.some(
    (followingId) => followingId.toString() === userId,
  );

  if (!isFollowing) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You can add only followed users to close friends");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: {
      closeFriends: userId,
    },
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "User added to close friends"));
});

export const removeCloseFriend = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  await User.findByIdAndUpdate(req.user._id, {
    $pull: {
      closeFriends: userId,
    },
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "User removed from close friends"));
});

export const getCloseFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("closeFriends", userPublicFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user.closeFriends, "Close friends fetched successfully"));
});

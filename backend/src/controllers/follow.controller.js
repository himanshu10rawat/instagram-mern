import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import FollowRequest from "../models/followRequest.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userPublicFields = "username fullname avatar bio isPrivate isVerified";

const validateUserId = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid user id");
  }
};

export const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  validateUserId(userId);

  if (currentUserId.toString() === userId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot follow yourself");
  }

  const targetUser = await User.findOne({
    _id: userId,
    isDeleted: false,
    isBlockedByAdmin: false,
  });

  if (!targetUser) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  const currentUser = await User.findById(currentUserId);

  if (
    targetUser.blockedUsers.includes(currentUserId) ||
    currentUser.blockedUsers.includes(userId)
  ) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot follow this user");
  }

  const alreadyFollowing = targetUser.followers.some(
    (followerId) => followerId.toString() === currentUserId.toString(),
  );

  if (alreadyFollowing) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You are already following this user");
  }

  if (targetUser.isPrivate) {
    const existingRequest = await FollowRequest.findOne({
      sender: currentUserId,
      receiver: userId,
      status: "pending",
    });

    if (existingRequest) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Follow request already sent");
    }

    const followRequest = await FollowRequest.create({
      sender: currentUserId,
      receiver: userId,
    });

    return res
      .status(HTTP_STATUS.CREATED)
      .json(new ApiResponse(HTTP_STATUS.CREATED, followRequest, "Follow request sent"));
  }

  await User.findByIdAndUpdate(currentUserId, {
    $addToSet: { following: userId },
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: { followers: currentUserId },
  });

  return res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "User followed successfully"));
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  validateUserId(userId);

  if (currentUserId.toString() === userId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid action");
  }

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { following: userId },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { followers: currentUserId },
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "User unfollowed successfully"));
});

export const cancelFollowRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  validateUserId(userId);

  const request = await FollowRequest.findOneAndDelete({
    sender: currentUserId,
    receiver: userId,
    status: "pending",
  });

  if (!request) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Follow request not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Follow request cancelled"));
});

export const acceptFollowRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const currentUserId = req.user._id;

  validateUserId(requestId);

  const request = await FollowRequest.findOne({
    _id: requestId,
    receiver: currentUserId,
    status: "pending",
  });

  if (!request) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Follow request not found");
  }

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(request.sender, {
    $addToSet: { following: currentUserId },
  });

  await User.findByIdAndUpdate(currentUserId, {
    $addToSet: { followers: request.sender },
  });

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Follow request accepted"));
});

export const rejectFollowRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const currentUserId = req.user._id;

  validateUserId(requestId);

  const request = await FollowRequest.findOneAndUpdate(
    {
      _id: requestId,
      receiver: currentUserId,
      status: "pending",
    },
    {
      status: "rejected",
    },
    {
      new: true,
    },
  );

  if (!request) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Follow request not found");
  }

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Follow request rejected"));
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateUserId(userId);

  const user = await User.findById(userId).populate("followers", userPublicFields);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user.followers, "Followers fetched successfully"));
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateUserId(userId);

  const user = await User.findById(userId).populate("following", userPublicFields);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user.following, "Following fetched successfully"));
});

export const getReceivedFollowRequests = asyncHandler(async (req, res) => {
  const requests = await FollowRequest.find({
    receiver: req.user._id,
    status: "pending",
  })
    .populate("sender", userPublicFields)
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, requests, "Follow requests fetched successfully"));
});

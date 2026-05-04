import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const userSelectFields =
  "-password -refreshToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil";

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "My profile fetched successfully"));
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({
    username: username.toLowerCase(),
    isDeleted: false,
    isBlockedByAdmin: false,
  }).select(userSelectFields);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  const isOwnProfile = req.user?._id?.toString() === user._id.toString();
  const isFollowing = user.followers.some(
    (followerId) => followerId.toString() === req.user?._id?.toString(),
  );

  if (user.isPrivate && !isOwnProfile && !isFollowing) {
    return res.status(HTTP_STATUS.Ok).json(
      new ApiResponse(
        HTTP_STATUS.Ok,
        {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          bio: user.bio,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
        "Private profile fetched successfully",
      ),
    );
  }

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Public profile fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "fullName",
    "bio",
    "website",
    "location",
    "profession",
    "gender",
    "accountType",
    "theme",
    "language",
    "links",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Profile updated successfully"));
});

export const updatePrivacySettings = asyncHandler(async (req, res) => {
  const { isPrivate, showActivityStatus, allowMessagesFrom, allowTagsFrom, allowMentionsFrom } =
    req.body;

  const updates = {};

  if (isPrivate !== undefined) {
    updates.isPrivate = isPrivate;
  }

  if (showActivityStatus !== undefined) {
    updates["privacySettings.showActivityStatus"] = showActivityStatus;
  }

  if (allowMessagesFrom !== undefined) {
    updates["privacySettings.allowMessagesFrom"] = allowMessagesFrom;
  }

  if (allowTagsFrom !== undefined) {
    updates["privacySettings.allowTagsFrom"] = allowTagsFrom;
  }

  if (allowMentionsFrom !== undefined) {
    updates["privacySettings.allowMentionsFrom"] = allowMentionsFrom;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Privacy settings updated successfully"));
});

export const softDeleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password is incorrect");
  }

  user.isDeleted = true;
  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });

  res
    .status(HTTP_STATUS.Ok)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Account removed successfully"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Avatar image is required");
  }

  const currentUser = await User.findById(req.user._id);

  if (currentUser.avatar?.publicId) {
    await cloudinary.uploader.destroy(currentUser.avatar.publicId);
  }

  const uploadedImage = await uploadToCloudinary(req.file.buffer, "instagram/avatar");

  currentUser.avatar = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
  };

  await currentUser.save({ validateBeforeSave: false });

  const user = await User.findById(req.user._id).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Avatar updated successfully"));
});

export const updateCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cover image is required");
  }

  const currentUser = await User.findById(req.user._id);

  if (currentUser.coverImage?.publicId) {
    await cloudinary.uploader.destroy(currentUser.coverImage.publicId);
  }

  const uploadedImage = await uploadToCloudinary(req.file.buffer, "instagram/cover");

  currentUser.coverImage = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
  };

  await currentUser.save({ validateBeforeSave: false });

  const user = await User.findById(req.user._id).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Cover image updated successfully"));
});

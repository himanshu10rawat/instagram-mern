import { HTTP_STATUS } from "../constants/httpStatus.js";
import FollowRequest from "../models/followRequest.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import trackAnalytics from "../utils/trackAnalytics.js";
import { cleanupDeletedUserData } from "../utils/accountCleanup.js";

const userSelectFields =
  "-password -refreshToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil";

const getProfilePosts = async (userId) => {
  return Post.find({
    author: userId,
    isDeleted: false,
    isArchived: false,
  })
    .populate("author", "username fullName avatar isVerified")
    .sort({ createdAt: -1 });
};

const buildProfilePayload = async (user, extraFields = {}) => {
  const posts = await getProfilePosts(user._id);
  const userObject = user.toObject();

  return {
    ...userObject,
    ...extraFields,
    posts,
    postsCount: posts.length,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
  };
};

const getUpdatedProfilePayload = async (userId, extraFields = {}) => {
  const user = await User.findById(userId).select(userSelectFields);
  return buildProfilePayload(user, extraFields);
};

const getPendingFollowRequest = async ({ sender, receiver }) => {
  if (!sender || !receiver) return null;

  return FollowRequest.findOne({
    sender,
    receiver,
    status: "pending",
  }).select("_id sender receiver status createdAt");
};

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(userSelectFields);
  const profile = await buildProfilePayload(user);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, profile, "My profile fetched successfully"));
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

  await trackAnalytics({
    owner: user._id,
    viewer: req.user?._id,
    type: "profile_visit",
    source: "profile",
    ip: req.ip,
    device: req.headers["user-agent"] || "",
  });

  const isOwnProfile = req.user?._id?.toString() === user._id.toString();

  const isFollowing = user.followers.some(
    (followerId) => followerId.toString() === req.user?._id?.toString(),
  );

  const canCheckRequests = !isOwnProfile && req.user?._id;
  const [outgoingFollowRequest, incomingFollowRequest] = canCheckRequests
    ? await Promise.all([
        getPendingFollowRequest({
          sender: req.user._id,
          receiver: user._id,
        }),
        getPendingFollowRequest({
          sender: user._id,
          receiver: req.user._id,
        }),
      ])
    : [null, null];

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
          hasPendingFollowRequest: Boolean(outgoingFollowRequest),
          incomingFollowRequest,
          postsCount: 0,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
        "Private profile fetched successfully",
      ),
    );
  }

  const profile = await buildProfilePayload(user, {
    hasPendingFollowRequest: Boolean(outgoingFollowRequest),
    incomingFollowRequest,
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, profile, "Public profile fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "fullName",
    "bio",
    "website",
    "isPrivate",
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
  const profile = await buildProfilePayload(user);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, profile, "Profile updated successfully"));
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
  const profile = await buildProfilePayload(user);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, profile, "Privacy settings updated successfully"));
});

export const softDeleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password is incorrect");
  }

  await cleanupDeletedUserData(user._id);

  user.isDeleted = true;
  user.username = `deleted_${user._id.toString().slice(-12)}`;
  user.fullName = "Deleted user";
  user.email = undefined;
  user.avatar = {};
  user.bio = "";
  user.website = "";
  user.location = "";
  user.profession = "";
  user.links = [];
  user.followers = [];
  user.following = [];
  user.blockedUsers = [];
  user.mutedUsers = [];
  user.closeFriends = [];
  user.isPrivate = true;
  user.isEmailVerified = false;
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodes = [];
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

  const profile = await getUpdatedProfilePayload(req.user._id);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, profile, "Avatar updated successfully"));
});


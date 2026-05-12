import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userSelectFields =
  "username fullName email phoneNumber theme language isPrivate notificationPreferences privacySettings accountType twoFactorEnabled";

export const getSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Settings fetched successfully"));
});

export const updateTheme = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { theme: req.body.theme },
    { new: true, runValidators: true },
  );

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Theme updated successfully"));
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { language: req.body.language },
    { new: true, runValidators: true },
  ).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Language updated successfully"));
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    updates[`notificationPreferences.${key}`] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select(userSelectFields);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, user, "Notification preferences updated successfully"));
});

export const updatePrivacyPreferences = asyncHandler(async (req, res) => {
  const { isPrivate, showActivityStatus, allowMessagesFrom, allowTagsFrom, allowMentionsFrom } =
    req.body;

  const updates = {};

  if (isPrivate !== undefined) updates.isPrivate = isPrivate;
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
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, "Privacy preferences updated successfully"));
});

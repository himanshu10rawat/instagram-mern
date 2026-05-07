import { HTTP_STATUS } from "../constants/httpStatus.js";
import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notification = await Notification.find({
    receiver: req.user._id,
  })
    .populate("sender", "username fullName avatar isVerified")
    .populate("post")
    .populate("story")
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, notification, "Notifications fetched"));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findByIdAndUpdate(notificationId, {
    isRead: true,
  });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Notification marked as read"));
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "All notification marked as read"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findByIdAndDelete(notificationId);

  res.status(HTTP_STATUS.Ok).json(new ApiResponse(HTTP_STATUS.Ok, null, "Notification deleted"));
});

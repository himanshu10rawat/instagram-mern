import { HTTP_STATUS } from "../constants/httpStatus.js";
import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const cacheKey = `notifications:${req.user._id}`;

  const cachedNotifications = await getCache(cacheKey);

  if (cachedNotifications) {
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, cachedNotifications, "Notifications fetched from cache"),
      );
  }

  const notifications = await Notification.find({
    receiver: req.user._id,
  })
    .populate("sender", "username fullName avatar isVerified")
    .populate("post")
    .populate("story")
    .populate("reel")
    .sort({ createdAt: -1 });

  await setCache(cacheKey, notifications, 30);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, notifications, "Notifications fetched"));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      receiver: req.user._id,
    },
    {
      isRead: true,
    },
  );

  await deleteCache(`notifications:${req.user._id}`);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Notification marked as read"));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      receiver: req.user._id,
      isRead: false,
    },
    {
      isRead: true,
    },
  );

  await deleteCache(`notifications:${req.user._id}`);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "All notifications marked as read"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findOneAndDelete({
    _id: notificationId,
    receiver: req.user._id,
  });

  await deleteCache(`notifications:${req.user._id}`);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Notification deleted"));
});

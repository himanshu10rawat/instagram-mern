import { HTTP_STATUS } from "../constants/httpStatus.js";
import FollowRequest from "../models/followRequest.model.js";
import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";

const getId = (value) => value?._id?.toString() || value?.toString();

const addFollowRequestActions = async (notifications, receiverId) => {
  const notificationItems = notifications.map((notification) =>
    typeof notification.toObject === "function" ? notification.toObject() : notification,
  );

  const senderIds = notificationItems
    .filter((notification) => notification.type === "follow_request")
    .map((notification) => getId(notification.sender))
    .filter(Boolean);

  if (!senderIds.length) {
    return notificationItems;
  }

  const pendingRequests = await FollowRequest.find({
    sender: { $in: senderIds },
    receiver: receiverId,
    status: "pending",
  }).select("sender receiver status createdAt");

  const requestBySenderId = new Map(
    pendingRequests.map((request) => [request.sender.toString(), request.toObject()]),
  );

  return notificationItems.map((notification) => {
    if (notification.type !== "follow_request") {
      return notification;
    }

    const senderId = getId(notification.sender);

    return {
      ...notification,
      followRequest: requestBySenderId.get(senderId) || null,
    };
  });
};

export const getNotifications = asyncHandler(async (req, res) => {
  const cacheKey = `notifications:${req.user._id}`;

  const cachedNotifications = await getCache(cacheKey);

  if (cachedNotifications) {
    const notifications = await addFollowRequestActions(cachedNotifications, req.user._id);

    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, notifications, "Notifications fetched from cache"),
      );
  }

  const notifications = await Notification.find({
    receiver: req.user._id,
  })
    .populate("sender", "username fullName avatar isVerified")
    .populate("post")
    .populate("story")
    .populate("reel")
    .populate("followRequest")
    .populate("message")
    .sort({ createdAt: -1 })
    .lean();

  const notificationsWithActions = await addFollowRequestActions(notifications, req.user._id);

  await setCache(cacheKey, notificationsWithActions, 30);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, notificationsWithActions, "Notifications fetched"));
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

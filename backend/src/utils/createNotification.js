import Notification from "../models/notification.model.js";
import { getUserSocket } from "../socket/onlineUsers.js";
import { getIO } from "../socket/socket.js";
import { deleteCache } from "./cache.js";

const createNotification = async ({
  sender,
  receiver,
  type,
  post = null,
  reel = null,
  story = null,
  comment = null,
  message = null,
}) => {
  if (!sender || !receiver) return null;

  if (sender.toString() === receiver.toString()) return null;

  const notification = await Notification.create({
    sender,
    receiver,
    type,
    post,
    reel,
    story,
    comment,
    message,
  });

  await deleteCache(`notifications:${receiver}`);

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "username fullName avatar isVerified")
    .populate("post")
    .populate("reel")
    .populate("story")
    .populate("message");

  const receiverSocketId = await getUserSocket(receiver);

  if (receiverSocketId) {
    getIO().to(receiverSocketId).emit("new_notification", populatedNotification);
  }

  return populatedNotification;
};

export default createNotification;

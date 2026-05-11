import Notification from "../models/notification.model";
import { getIO } from "../socket/socket.js";
import { getUserSocket } from "../socket/onlineUsers.js";

const createNotification = async ({
  sender,
  receiver,
  type,
  post = null,
  story = null,
  reel = null,
  comment = null,
}) => {
  if (sender.toString() === receiver.toString()) {
    return;
  }

  const notification = await Notification.create({
    sender,
    receiver,
    type,
    post,
    story,
    reel,
    comment,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "username fullName avatar isVerified")
    .populate("post")
    .populate("story")
    .populate("reel");

  const io = getIO();

  const receiverSocketId = getUserSocket(receiver);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("new_notification", populatedNotification);
  }

  return populatedNotification;
};

export default createNotification;

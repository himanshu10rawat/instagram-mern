import Notification from "../models/notification.model";

const createNotification = async ({
  sender,
  receiver,
  type,
  post = null,
  story = null,
  comment = null,
}) => {
  if (sender.toString() === receiver.toString()) {
    return; // Self notification avoid
  }

  await Notification.create({
    sender,
    receiver,
    type,
    post,
    story,
    comment,
  });
};

export default createNotification;

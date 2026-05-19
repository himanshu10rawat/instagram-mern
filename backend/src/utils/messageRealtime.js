import Conversation from "../models/conversation.model.js";

const userPublicFields = "username fullName avatar isVerified";

export const getPopulatedConversation = async (conversationId, unreadCount = 0) => {
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", userPublicFields)
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: userPublicFields,
      },
    });

  if (!conversation) return null;

  return {
    ...conversation.toObject(),
    unreadCount,
  };
};

export const buildRealtimeMessagePayload = async (message, conversationId, unreadCount = 1) => {
  const conversationDetails = await getPopulatedConversation(conversationId, unreadCount);
  const messageObject = message.toObject ? message.toObject() : message;

  return {
    ...messageObject,
    conversationDetails,
  };
};

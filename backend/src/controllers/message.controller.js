import mongoose from "mongoose";

import { getUserSocket } from "../socket/onlineUsers.js";
import { getIO } from "../socket/socket.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import {
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
  getVideoThumbnailUrl,
} from "../utils/cloudinaryUrl.js";

const userPublicFields = "username fullName avatar isVerified";

const messagePopulate = [
  {
    path: "sender",
    select: userPublicFields,
  },
  {
    path: "seenBy.user",
    select: userPublicFields,
  },
  {
    path: "replyTo",
    populate: {
      path: "sender",
      select: userPublicFields,
    },
  },
  {
    path: "reactions.user",
    select: userPublicFields,
  },
  {
    path: "shared.post",
    populate: {
      path: "author",
      select: userPublicFields,
    },
  },
  {
    path: "shared.reel",
    populate: {
      path: "author",
      select: userPublicFields,
    },
  },
  {
    path: "shared.story",
    populate: {
      path: "author",
      select: userPublicFields,
    },
  },
  {
    path: "shared.profile",
    select: userPublicFields,
  },
];

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

const getMediaType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid media type");
};

const findOrCreateConversation = async (currentUserId, receiverId) => {
  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: {
      $all: [currentUserId, receiverId],
      $size: 2,
    },
  });

  if (!conversation) {
    const receiver = await User.findById(receiverId).select("followers privacySettings");

    const isReceiverFollowingSender = receiver.followers.some(
      (followerId) => followerId.toString() === currentUserId.toString(),
    );

    const allowMessagesFrom = receiver.privacySettings?.allowMessagesFrom || "everyone";

    const shouldRequest =
      allowMessagesFrom === "none" ||
      (allowMessagesFrom === "followers" && !isReceiverFollowingSender);

    conversation = await Conversation.create({
      participants: [currentUserId, receiverId],
      status: shouldRequest ? "requested" : "accepted",
      requestedBy: shouldRequest ? currentUserId : null,
    });
  }

  return conversation;
};

export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const { text, replyTo } = req.body;

  validateObjectId(receiverId, "Invalid receiver id");

  if (req.user._id.toString() === receiverId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot message yourself");
  }

  const receiver = await User.findOne({
    _id: receiverId,
    isDeleted: false,
    isBlockedByAdmin: false,
  });

  if (!receiver) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Receiver not found");
  }

  if (replyTo) {
    validateObjectId(replyTo, "Invalid reply message id");

    const replyMessage = await Message.findById(replyTo);

    if (!replyMessage) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reply message not found");
    }
  }

  if (!text && !req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Message text or media is required");
  }

  const conversation = await findOrCreateConversation(req.user._id, receiverId);

  let media = null;
  let messageType = "text";

  if (req.file) {
    const uploadedMedia = await uploadToCloudinary(req.file.buffer, "instagram/messages", "auto");

    const mediaType = getMediaType(req.file.mimetype);

    media = {
      url: uploadedMedia.secure_url,
      optimizedUrl:
        mediaType === "image"
          ? getOptimizedImageUrl(uploadedMedia.public_id)
          : getOptimizedVideoUrl(uploadedMedia.public_id),
      thumbnailUrl:
        mediaType === "image"
          ? getOptimizedImageUrl(uploadedMedia.public_id, {
              width: 400,
              height: 400,
              crop: "fill",
            })
          : getVideoThumbnailUrl(uploadedMedia.public_id, {
              width: 400,
              height: 400,
              crop: "fill",
            }),
      publicId: uploadedMedia.public_id,
      type: mediaType,
    };

    messageType = mediaType;
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: text || "",
    media,
    messageType,
    replyTo: replyTo || null,
    seenBy: [
      {
        user: req.user._id,
        seenAt: new Date(),
      },
    ],
  });

  conversation.lastMessage = message._id;
  conversation.deletedFor = [];
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate(messagePopulate);

  const io = getIO();
  const receiverSocketId = await getUserSocket(receiverId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receive_message", populatedMessage);
  }

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, populatedMessage, "Message sent successfully"));
});

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    status: "accepted",
    deletedFor: {
      $ne: req.user._id,
    },
  })
    .populate("participants", userPublicFields)
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: userPublicFields,
      },
    })
    .sort({ updatedAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, conversations, "Conversations fetched successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  validateObjectId(conversationId, "Invalid conversation id");

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 30, 50);
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Conversation not found");
  }

  const messages = await Message.find({
    conversation: conversationId,
    deletedFor: {
      $ne: req.user._id,
    },
    isDeletedForEveryone: false,
  })
    .populate(messagePopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit,
        },
      },
      "Messages fetched successfully",
    ),
  );
});

export const markConversationAsSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  validateObjectId(conversationId, "Invalid conversation id");

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Conversation not found");
  }

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: {
        $ne: req.user._id,
      },
      "seenBy.user": {
        $ne: req.user._id,
      },
    },
    {
      $push: {
        seenBy: {
          user: req.user._id,
          seenAt: new Date(),
        },
      },
    },
  );

  const io = getIO();

  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user._id.toString()) {
      const participantSocketId = await getUserSocket(participantId);

      if (participantSocketId) {
        io.to(participantSocketId).emit("messages_seen", {
          conversationId,
          seenBy: req.user._id,
        });
      }
    }
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Conversation marked as seen"));
});

export const deleteMessageForMe = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  validateObjectId(messageId, "Invalid message id");

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message not found");
  }

  const conversation = await Conversation.findOne({
    _id: message.conversation,
    participants: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message not found");
  }

  const alreadyDeleted = message.deletedFor.some(
    (userId) => userId.toString() === req.user._id.toString(),
  );

  if (!alreadyDeleted) {
    message.deletedFor.push(req.user._id);
    await message.save();
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Message deleted for you"));
});

export const deleteMessageForEveryone = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  validateObjectId(messageId, "Invalid message id");

  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      sender: req.user._id,
    },
    {
      isDeletedForEveryone: true,
      text: "",
      media: null,
    },
    {
      new: true,
    },
  );

  if (!message) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Message deleted for everyone"));
});

export const deleteConversationForMe = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  validateObjectId(conversationId, "Invalid conversation id");

  const conversation = await Conversation.findOneAndUpdate(
    {
      _id: conversationId,
      participants: req.user._id,
    },
    {
      $addToSet: {
        deletedFor: req.user._id,
      },
    },
    {
      new: true,
    },
  );

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Conversation not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Conversation deleted for you"));
});

export const reactToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  validateObjectId(messageId, "Invalid message id");

  const message = await Message.findOne({
    _id: messageId,
    isDeletedForEveryone: false,
  });

  if (!message) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message not found");
  }

  const conversation = await Conversation.findOne({
    _id: message.conversation,
    participants: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot react to this message");
  }

  message.reactions = message.reactions.filter(
    (reaction) => reaction.user.toString() !== req.user._id.toString(),
  );

  message.reactions.push({
    user: req.user._id,
    emoji,
    reactedAt: new Date(),
  });

  await message.save();

  const populatedMessage = await Message.findById(message._id).populate(messagePopulate);

  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user._id.toString()) {
      const participantSocketId = await getUserSocket(participantId);

      if (participantSocketId) {
        getIO().to(participantSocketId).emit("message_reaction", populatedMessage);
      }
    }
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, populatedMessage, "Reaction added successfully"));
});

export const removeMessageReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  validateObjectId(messageId, "Invalid message id");

  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      isDeletedForEveryone: false,
    },
    {
      $pull: {
        reactions: {
          user: req.user._id,
        },
      },
    },
    {
      new: true,
    },
  ).populate(messagePopulate);

  if (!message) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, message, "Reaction removed successfully"));
});

export const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  validateObjectId(messageId, "Invalid message id");

  const message = await Message.findOne({
    _id: messageId,
    sender: req.user._id,
    messageType: "text",
    isDeletedForEveryone: false,
  });

  if (!message) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message not found or cannot be edited");
  }

  message.text = text;
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();

  const populatedMessage = await Message.findById(message._id).populate(messagePopulate);

  const conversation = await Conversation.findById(message.conversation);

  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user._id.toString()) {
      const participantSocketId = await getUserSocket(participantId);

      if (participantSocketId) {
        getIO().to(participantSocketId).emit("message_edited", populatedMessage);
      }
    }
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, populatedMessage, "Message edited successfully"));
});

export const forwardMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { receiverId } = req.body;

  validateObjectId(messageId, "Invalid message id");
  validateObjectId(receiverId, "Invalid receiver id");

  if (req.user._id.toString() === receiverId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot forward message to yourself");
  }

  const originalMessage = await Message.findOne({
    _id: messageId,
    isDeletedForEveryone: false,
  });

  if (!originalMessage) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Original message not found");
  }

  const originalConversation = await Conversation.findOne({
    _id: originalMessage.conversation,
    participants: req.user._id,
  });

  if (!originalConversation) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot forward this message");
  }

  const receiver = await User.findOne({
    _id: receiverId,
    isDeleted: false,
    isBlockedByAdmin: false,
  });

  if (!receiver) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Receiver not found");
  }

  const conversation = await findOrCreateConversation(req.user._id, receiverId);

  const forwardedMessage = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: originalMessage.text,
    media: originalMessage.media,
    messageType: originalMessage.messageType,
    shared: originalMessage.shared,
    seenBy: [
      {
        user: req.user._id,
        seenAt: new Date(),
      },
    ],
  });

  conversation.lastMessage = forwardedMessage._id;
  conversation.deletedFor = [];
  await conversation.save();

  const populatedMessage = await Message.findById(forwardedMessage._id).populate(messagePopulate);

  const receiverSocketId = await getUserSocket(receiverId);

  if (receiverSocketId) {
    getIO().to(receiverSocketId).emit("receive_message", populatedMessage);
  }

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, populatedMessage, "Message forwarded successfully"));
});

export const getMessageRequests = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    status: "requested",
    requestedBy: {
      $ne: req.user._id,
    },
    deletedFor: {
      $ne: req.user._id,
    },
  })
    .populate("participants", userPublicFields)
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: userPublicFields,
      },
    })
    .sort({ updatedAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, conversations, "Message requests fetched successfully"));
});

export const acceptMessageRequest = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  validateObjectId(conversationId, "Invalid conversation id");

  const conversation = await Conversation.findOneAndUpdate(
    {
      _id: conversationId,
      participants: req.user._id,
      status: "requested",
      requestedBy: {
        $ne: req.user._id,
      },
    },
    {
      status: "accepted",
    },
    {
      new: true,
    },
  ).populate("participants", userPublicFields);

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message request not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, conversation, "Message request accepted"));
});

export const rejectMessageRequest = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  validateObjectId(conversationId, "Invalid conversation id");

  const conversation = await Conversation.findOneAndUpdate(
    {
      _id: conversationId,
      participants: req.user._id,
      status: "requested",
      requestedBy: {
        $ne: req.user._id,
      },
    },
    {
      $addToSet: {
        deletedFor: req.user._id,
      },
    },
    {
      new: true,
    },
  );

  if (!conversation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Message request not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Message request rejected"));
});

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
    conversation = await Conversation.create({
      participants: [currentUserId, receiverId],
    });
  }

  return conversation;
};

export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const { text } = req.body;

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

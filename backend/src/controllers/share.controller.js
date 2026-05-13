import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import { getUserSocket } from "../socket/onlineUsers.js";
import { getIO } from "../socket/socket.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userPublicFields = "username fullName avatar isVerified";

const messagePopulate = [
  {
    path: "sender",
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

const getSharePayload = async ({ postId, reelId, storyId, profileId }) => {
  if (postId) {
    validateObjectId(postId, "Invalid post id");

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      isArchived: false,
    });

    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
    }

    await Post.findByIdAndUpdate(postId, {
      $inc: {
        sharesCount: 1,
      },
    });

    return {
      messageType: "shared_post",
      shared: {
        post: postId,
      },
    };
  }

  if (reelId) {
    validateObjectId(reelId, "Invalid reel id");

    const reel = await Reel.findOne({
      _id: reelId,
      isDeleted: false,
    });

    if (!reel) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
    }

    await Reel.findByIdAndUpdate(reelId, {
      $inc: {
        sharesCount: 1,
      },
    });

    return {
      messageType: "shared_reel",
      shared: {
        reel: reelId,
      },
    };
  }

  if (storyId) {
    validateObjectId(storyId, "Invalid story id");

    const story = await Story.findOne({
      _id: storyId,
      expiresAt: {
        $gt: new Date(),
      },
      isDeleted: false,
    });

    if (!story) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found or expired");
    }

    return {
      messageType: "shared_story",
      shared: {
        story: storyId,
      },
    };
  }

  validateObjectId(profileId, "Invalid profile id");

  const profile = await User.findOne({
    _id: profileId,
    isDeleted: false,
    isBlockedByAdmin: false,
  });

  if (!profile) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Profile not found");
  }

  return {
    messageType: "shared_profile",
    shared: {
      profile: profileId,
    },
  };
};

export const shareToUser = asyncHandler(async (req, res) => {
  const { receiverId, postId, reelId, storyId, profileId, text } = req.body;

  validateObjectId(receiverId, "Invalid receiver id");

  if (req.user._id.toString() === receiverId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot share to yourself");
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

  const sharePayload = await getSharePayload({
    postId,
    reelId,
    storyId,
    profileId,
  });

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: text || "",
    media: null,
    messageType: sharePayload.messageType,
    shared: sharePayload.shared,
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

  const receiverSocketId = await getUserSocket(receiverId);

  if (receiverSocketId) {
    getIO().to(receiverSocketId).emit("receive_message", populatedMessage);
  }

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, populatedMessage, "Shared successfully"));
});

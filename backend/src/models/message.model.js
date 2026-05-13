import mongoose from "mongoose";

const messageMediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    optimizedUrl: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      default: "",
    },

    media: {
      type: messageMediaSchema,
      default: null,
    },

    shared: {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
      },
      reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel",
        default: null,
      },
      story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        default: null,
      },
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "shared_post",
        "shared_reel",
        "shared_story",
        "shared_profile",
      ],
      default: "text",
    },

    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

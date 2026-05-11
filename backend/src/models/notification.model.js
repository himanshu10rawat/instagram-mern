import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "follow",
        "follow_request",
        "like",
        "comment",
        "story_like",
        "story_reply",
        "reel_like",
        "reel_comment",
      ],
      required: true,
      index: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reel",
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ receiver: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

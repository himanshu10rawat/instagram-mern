import mongoose from "mongoose";

const reelCommentSchema = new mongoose.Schema(
  {
    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reel",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment exceed 1000 characters"],
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReelComment",
      default: null,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

reelCommentSchema.index({ reel: 1, createdAt: -1 });

const ReelComment = mongoose.model("ReelComment", reelCommentSchema);

export default ReelComment;

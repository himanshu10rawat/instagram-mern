import mongoose from "mongoose";

const storyMediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
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
  {
    _id: false,
  },
);

const storyViewerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    media: {
      type: storyMediaSchema,
      required: true,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [300, "Story caption cannot exceed 300 characters"],
    },

    visibility: {
      type: String,
      enum: ["public", "close_friends"],
      default: "public",
    },

    viewers: [storyViewerSchema],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Reply cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
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

storySchema.index({ author: 1, createdAt: -1 });

const Story = mongoose.model("Story", storySchema);

export default Story;

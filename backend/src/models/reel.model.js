import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    video: {
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
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
      default: "",
    },

    hashtags: [{ type: String, lowercase: true, trim: true }],

    audioName: {
      type: String,
      trim: true,
      default: "Original Audio",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    viewsCount: {
      type: Number,
      default: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
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

reelSchema.index({ caption: "text", hashtags: "text", audioName: "text" });
reelSchema.index({ author: 1, createdAt: -1 });
reelSchema.index({ createdAt: -1, viewsCount: -1 });

const Reel = mongoose.model("Reel", reelSchema);

export default Reel;

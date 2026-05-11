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
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [2200, "Capation cannot exceed 2200 characters"],
      default: "",
    },

    hashtags: [{ type: String, lowecase: true, trim: true }],

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

reelSchema.index({ caption: "text", hastags: "text", audioName: "text" });
reelSchema.index({ author: 1, createdAt: -1 });
reelSchema.index({ createdAt: -1, viewCount: -1 });

const Reel = mongoose.model("Reel", reelSchema);

export default Reel;

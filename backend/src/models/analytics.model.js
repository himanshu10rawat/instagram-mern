import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: ["profile_visit", "post_impression", "reel_impression", "story_impression"],
      required: true,
      index: true,
    },

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

    metadata: {
      source: {
        type: String,
        enum: ["feed", "explore", "profile", "reels", "story", "search", "direct"],
        default: "direct",
      },

      device: {
        type: String,
        default: "",
      },

      ip: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

analyticsSchema.index({ owner: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ post: 1, type: 1 });
analyticsSchema.index({ reel: 1, type: 1 });
analyticsSchema.index({ story: 1, type: 1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;

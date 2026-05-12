import mongoose from "mongoose";

const liveSessionSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    channelName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    thumbnail: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    viewersCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

liveSessionSchema.index({ status: 1, createdAt: -1 });

const LiveSession = mongoose.model("LiveSession", liveSessionSchema);

export default LiveSession;

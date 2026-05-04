import mongoose from "mongoose";

const followRequestSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

followRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const FollowRequest = mongoose.model("FollowRequest", followRequestSchema);

export default FollowRequest;

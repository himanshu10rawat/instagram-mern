import mongoose from "mongoose";

const hashtagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    postsCount: {
      type: Number,
      default: 0,
    },

    reelsCount: {
      type: Number,
      default: 0,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

hashtagSchema.index({
  name: "text",
});

const Hashtag = mongoose.model("Hashtag", hashtagSchema);

export default Hashtag;

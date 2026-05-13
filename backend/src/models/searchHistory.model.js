import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    searchType: {
      type: String,
      enum: ["user", "hashtag", "post", "reel", "text"],
      required: true,
      index: true,
    },

    query: {
      type: String,
      trim: true,
      default: "",
    },

    searchedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    hashtag: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

searchHistorySchema.index({ user: 1, updatedAt: -1 });

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;

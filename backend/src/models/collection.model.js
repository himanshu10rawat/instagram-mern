import mongoose from "mongoose";

const collectionItemSchema = new mongoose.Schema(
  {
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

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const collectionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Collection name cannot exceed 50 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    items: [collectionItemSchema],

    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

collectionSchema.index({ owner: 1, name: 1 }, { unique: true });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;

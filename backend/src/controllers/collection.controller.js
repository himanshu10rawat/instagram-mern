import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import Collection from "../models/collection.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

const buildCollectionItem = ({ postId, reelId }) => {
  if (postId) {
    validateObjectId(postId, "Invalid post id");

    return {
      post: postId,
      reel: null,
      addedAt: new Date(),
    };
  }

  validateObjectId(reelId, "Invalid reel id");

  return {
    post: null,
    reel: reelId,
    addedAt: new Date(),
  };
};

export const createCollection = asyncHandler(async (req, res) => {
  const { name, description, isPrivate } = req.body;

  const collection = await Collection.create({
    owner: req.user._id,
    name,
    description: description || "",
    isPrivate: isPrivate ?? true,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, collection, "Collection created successfully"));
});

export const getMyCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({
    owner: req.user._id,
  })
    .populate("items.post")
    .populate("items.reel")
    .sort({ updatedAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, collections, "Collections fetched successfully"));
});

export const getCollectionById = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  validateObjectId(collectionId, "Invalid collection id");

  const collection = await Collection.findOne({
    _id: collectionId,
    owner: req.user._id,
  })
    .populate("items.post")
    .populate("items.reel");

  if (!collection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collection not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, collection, "Collection fetched successfully"));
});

export const updateCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  validateObjectId(collectionId, "Invalid collection id");

  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.isPrivate !== undefined) updates.isPrivate = req.body.isPrivate;

  const collection = await Collection.findOneAndUpdate(
    {
      _id: collectionId,
      owner: req.user._id,
    },
    updates,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!collection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collection not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, collection, "Collection updated successfully"));
});

export const addItemToCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const { postId, reelId } = req.body;

  validateObjectId(collectionId, "Invalid collection id");

  if (postId) {
    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      isArchived: false,
    });

    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
    }

    await Post.findByIdAndUpdate(postId, {
      $addToSet: {
        savedBy: req.user._id,
      },
    });
  }

  if (reelId) {
    const reel = await Reel.findOne({
      _id: reelId,
      isDeleted: false,
    });

    if (!reel) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
    }

    await Reel.findByIdAndUpdate(reelId, {
      $addToSet: {
        savedBy: req.user._id,
      },
    });
  }

  const item = buildCollectionItem({ postId, reelId });

  const collection = await Collection.findOne({
    _id: collectionId,
    owner: req.user._id,
  });

  if (!collection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collection not found");
  }

  const alreadyExists = collection.items.some((collectionItem) => {
    const existingPostId = collectionItem.post?.toString();
    const existingReelId = collectionItem.reel?.toString();

    return existingPostId === postId || existingReelId === reelId;
  });

  if (alreadyExists) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Item already exists in collection");
  }

  collection.items.push(item);

  if (!collection.coverImage) {
    collection.coverImage = postId || reelId;
  }

  await collection.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, collection, "Item added to collection"));
});

export const removeItemFromCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const { postId, reelId } = req.body;

  validateObjectId(collectionId, "Invalid collection id");

  const collection = await Collection.findOne({
    _id: collectionId,
    owner: req.user._id,
  });

  if (!collection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collection not found");
  }

  collection.items = collection.items.filter((item) => {
    if (postId) {
      return item.post?.toString() !== postId;
    }

    return item.reel?.toString() !== reelId;
  });

  await collection.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, collection, "Item removed from collection"));
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  validateObjectId(collectionId, "Invalid collection id");

  const collection = await Collection.findOneAndDelete({
    _id: collectionId,
    owner: req.user._id,
  });

  if (!collection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Collection not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Collection deleted successfully"));
});

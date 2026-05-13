import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import Highlight from "../models/highlight.model.js";
import Story from "../models/story.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

const validateStoryOwnership = async ({ storyId, userId }) => {
  validateObjectId(storyId, "Invalid story id");

  const story = await Story.findOne({
    _id: storyId,
    author: userId,
    isDeleted: false,
  });

  if (!story) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Story not found");
  }

  return story;
};

export const createHighlight = asyncHandler(async (req, res) => {
  const { title, storyIds = [] } = req.body;

  const validStories = [];

  for (const storyId of storyIds) {
    const story = await validateStoryOwnership({
      storyId,
      userId: req.user._id,
    });

    validStories.push(story._id);
  }

  const highlight = await Highlight.create({
    owner: req.user._id,
    title,
    stories: validStories,
  });

  const populatedHighlight = await Highlight.findById(highlight._id).populate("stories");

  return res
    .status(HTTP_STATUS.CREATED)
    .json(
      new ApiResponse(HTTP_STATUS.CREATED, populatedHighlight, "Highlight created successfully"),
    );
});

export const getMyHighlights = asyncHandler(async (req, res) => {
  const highlights = await Highlight.find({
    owner: req.user._id,
    isDeleted: false,
  })
    .populate("stories")
    .sort({ createdAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, highlights, "Highlights fetched successfully"));
});

export const getUserHighlights = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  validateObjectId(userId, "Invalid user id");

  const highlights = await Highlight.find({
    owner: userId,
    isDeleted: false,
  })
    .populate("stories")
    .sort({ createdAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, highlights, "User highlights fetched successfully"));
});

export const updateHighlight = asyncHandler(async (req, res) => {
  const { highlightId } = req.params;

  validateObjectId(highlightId, "Invalid highlight id");

  const highlight = await Highlight.findOneAndUpdate(
    {
      _id: highlightId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      title: req.body.title,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("stories");

  if (!highlight) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Highlight not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, highlight, "Highlight updated successfully"));
});

export const addStoryToHighlight = asyncHandler(async (req, res) => {
  const { highlightId } = req.params;
  const { storyId } = req.body;

  validateObjectId(highlightId, "Invalid highlight id");

  await validateStoryOwnership({
    storyId,
    userId: req.user._id,
  });

  const highlight = await Highlight.findOneAndUpdate(
    {
      _id: highlightId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      $addToSet: {
        stories: storyId,
      },
    },
    {
      new: true,
    },
  ).populate("stories");

  if (!highlight) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Highlight not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, highlight, "Story added to highlight"));
});

export const removeStoryFromHighlight = asyncHandler(async (req, res) => {
  const { highlightId } = req.params;
  const { storyId } = req.body;

  validateObjectId(highlightId, "Invalid highlight id");
  validateObjectId(storyId, "Invalid story id");

  const highlight = await Highlight.findOneAndUpdate(
    {
      _id: highlightId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      $pull: {
        stories: storyId,
      },
    },
    {
      new: true,
    },
  ).populate("stories");

  if (!highlight) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Highlight not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, highlight, "Story removed from highlight"));
});

export const deleteHighlight = asyncHandler(async (req, res) => {
  const { highlightId } = req.params;

  validateObjectId(highlightId, "Invalid highlight id");

  const highlight = await Highlight.findOneAndUpdate(
    {
      _id: highlightId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  if (!highlight) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Highlight not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Highlight deleted successfully"));
});

import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import SearchHistory from "../models/searchHistory.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userPublicFields = "username fullName avatar isVerified";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

export const saveSearchHistory = asyncHandler(async (req, res) => {
  const { searchType, query, searchedUserId, hashtag } = req.body;

  const filter = {
    user: req.user._id,
    searchType,
  };

  const updateData = {
    user: req.user._id,
    searchType,
    query: query || "",
    searchedUser: null,
    hashtag: "",
  };

  if (searchedUserId) {
    validateObjectId(searchedUserId, "Invalid searched user id");

    const searchedUser = await User.findOne({
      _id: searchedUserId,
      isDeleted: false,
      isBlockedByAdmin: false,
    });

    if (!searchedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Searched user not found");
    }

    filter.searchedUser = searchedUserId;
    updateData.searchedUser = searchedUserId;
  } else if (hashtag) {
    const normalizedHashtag = hashtag.replace("#", "").toLowerCase();

    filter.hashtag = normalizedHashtag;
    updateData.hashtag = normalizedHashtag;
    updateData.query = normalizedHashtag;
  } else {
    filter.query = query?.trim().toLowerCase();
    updateData.query = query?.trim().toLowerCase();
  }

  const history = await SearchHistory.findOneAndUpdate(filter, updateData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }).populate("searchedUser", userPublicFields);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, history, "Search saved successfully"));
});

export const getRecentSearches = asyncHandler(async (req, res) => {
  const searches = await SearchHistory.find({
    user: req.user._id,
  })
    .populate("searchedUser", userPublicFields)
    .sort({ updatedAt: -1 })
    .limit(20);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, searches, "Recent searches fetched successfully"));
});

export const deleteSearchHistoryItem = asyncHandler(async (req, res) => {
  const { searchId } = req.params;

  validateObjectId(searchId, "Invalid search id");

  await SearchHistory.findOneAndDelete({
    _id: searchId,
    user: req.user._id,
  });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Search removed successfully"));
});

export const clearSearchHistory = asyncHandler(async (req, res) => {
  await SearchHistory.deleteMany({
    user: req.user._id,
  });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Search history cleared successfully"));
});

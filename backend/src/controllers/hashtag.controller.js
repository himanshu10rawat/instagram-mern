import { HTTP_STATUS } from "../constants/httpStatus.js";
import Hashtag from "../models/hashtag.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userPublicFields = "username fullName avatar isVerified";

export const getHashtagDetails = asyncHandler(async (req, res) => {
  const name = req.params.name?.toLowerCase();

  const hashtag = await Hashtag.findOne({ name });

  if (!hashtag) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Hashtag not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, hashtag, "Hashtag fetched successfully"));
});

export const getHashtagPosts = asyncHandler(async (req, res) => {
  const name = req.params.name?.toLowerCase();

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const posts = await Post.find({
    tags: name,
    isDeleted: false,
    isArchived: false,
  })
    .populate("author", userPublicFields)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        posts,
        pagination: {
          page,
          limit,
          hasMore: posts.length === limit,
        },
      },
      "Hashtag posts fetched successfully",
    ),
  );
});

export const getHashtagReels = asyncHandler(async (req, res) => {
  const name = req.params.name?.toLowerCase();

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const reels = await Reel.find({
    hashtags: name,
    isDeleted: false,
  })
    .populate("author", userPublicFields)
    .sort({ viewsCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        reels,
        pagination: {
          page,
          limit,
          hasMore: reels.length === limit,
        },
      },
      "Hashtag reels fetched successfully",
    ),
  );
});

export const followHashtag = asyncHandler(async (req, res) => {
  const name = req.params.name?.toLowerCase();

  const hashtag = await Hashtag.findOneAndUpdate(
    { name },
    {
      $addToSet: {
        followers: req.user._id,
      },
    },
    {
      new: true,
    },
  );

  if (!hashtag) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Hashtag not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, hashtag, "Hashtag followed successfully"));
});

export const unfollowHashtag = asyncHandler(async (req, res) => {
  const name = req.params.name?.toLowerCase();

  const hashtag = await Hashtag.findOneAndUpdate(
    { name },
    {
      $pull: {
        followers: req.user._id,
      },
    },
    {
      new: true,
    },
  );

  if (!hashtag) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Hashtag not found");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, hashtag, "Hashtag unfollowed successfully"));
});

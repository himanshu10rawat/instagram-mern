import { HTTP_STATUS } from "../constants/httpStatus.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const userPublicFields = "username fullName avatar bio isVerified followers following isPrivate";

export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res
      .status(HTTP_STATUS.Ok)
      .json(new ApiResponse(HTTP_STATUS.Ok, [], "Users fetched successfully"));
  }

  const users = await User.find({
    isDeleted: false,
    isBlockedByAdmin: false,
    $or: [
      { username: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
    ],
  })
    .select(userPublicFields)
    .limit(20)
    .sort({ followers: -1 });

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, users, "Users fetched successfully"));
});

export const searchPosts = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res
      .status(HTTP_STATUS.Ok)
      .json(new ApiResponse(HTTP_STATUS.Ok, [], "Posts fetched successfully"));
  }

  const posts = await Post.find({
    isDeleted: false,
    isArchived: false,
    $text: {
      $search: query,
    },
  })
    .populate("author", "username fullName avatar isVerified")
    .sort({
      createdAt: -1,
    })
    .limit(20);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, posts, "Posts fetched successfully"));
});

export const searchReels = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res
      .status(HTTP_STATUS.Ok)
      .json(new ApiResponse(HTTP_STATUS.Ok, [], "Reels fetched successfully"));
  }

  const reels = await Reel.find({
    isDeleted: false,
    $text: {
      $search: query,
    },
  })
    .populate("author", "username fullName avatar isVerified")
    .sort({
      viewsCount: -1,
      createdAt: -1,
    })
    .limit(20);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, reels, "Reels fetched successfully"));
});

export const searchHashtags = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim()?.replace("#", "");

  if (!query) {
    return res
      .status(HTTP_STATUS.Ok)
      .json(new ApiResponse(HTTP_STATUS.Ok, [], "Hashtags fetched successfully"));
  }

  const hashtags = await Post.aggregate([
    {
      $match: {
        isDeleted: false,
        tags: {
          $regex: query,
          $options: "i",
        },
      },
    },
    {
      $unwind: "$tags",
    },
    {
      $match: {
        tags: {
          $regex: query,
          $options: "i",
        },
      },
    },
    {
      $group: {
        _id: "$tags",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
    {
      $limit: 20,
    },
  ]);

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, hashtags, "Hashtags fetched successfully"));
});

export const getExploreFeed = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id).select("following blockedUsers");

  const posts = await Post.find({
    author: {
      $nin: [...currentUser.following, ...currentUser.blockedUsers],
    },
    isDeleted: false,
    isArchived: false,
  })
    .populate("author", "username fullName avatar isVerified")
    .sort({
      likes: -1,
      commentsCount: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  res.status(HTTP_STATUS.Ok).json(
    new ApiResponse(
      HTTP_STATUS.Ok,
      {
        posts,
        pagination: {
          page,
          limit,
          hasMore: posts.length === limit,
        },
      },
      "Explore feed fetched successfully",
    ),
  );
});

export const getTrendingReels = asyncHandler(async (_req, res) => {
  const reels = await Reel.find({
    isDeleted: false,
  })
    .populate("author", "username fullName avatar isVerified")
    .sort({
      viewsCount: -1,
      likes: -1,
      commentsCount: -1,
      createdAt: -1,
    })
    .limit(30);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, reels, "Trending reels fetched successfully"));
});

export const getTrendingHashtags = asyncHandler(async (_req, res) => {
  const hashtags = await Post.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $unwind: "$tags",
    },
    {
      $group: {
        _id: "$tags",
        totalPosts: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        totalPosts: -1,
      },
    },
    {
      $limit: 20,
    },
  ]);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, hashtags, "Trending hashtags fetched successfully"));
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select("following blockedUsers");

  const excludedUsers = [req.user._id, ...currentUser.following, ...currentUser.blockedUsers];

  const users = await User.find({
    _id: {
      $nin: excludedUsers,
    },
    isDeleted: false,
    isBlockedByAdmin: false,
  })
    .select(userPublicFields)
    .sort({
      followers: -1,
      createdAt: -1,
    })
    .limit(20);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, users, "Suggested users fetched successfully"));
});

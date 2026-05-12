import { HTTP_STATUS } from "../constants/httpStatus.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getCache, setCache } from "../utils/cache.js";

const userPublicFields = "username fullName avatar bio isVerified followers following isPrivate";
const authorPublicFields = "username fullName avatar isVerified";

const getVisibleAuthorIds = async (currentUser, currentUserId) => {
  return User.find({
    _id: {
      $nin: [currentUserId, ...currentUser.blockedUsers],
    },
    isDeleted: false,
    isBlockedByAdmin: false,
    blockedUsers: {
      $ne: currentUserId,
    },
    $or: [
      { isPrivate: false },
      {
        _id: {
          $in: currentUser.following,
        },
      },
    ],
  }).distinct("_id");
};

const getUserInterestTags = async (userId) => {
  const likedPosts = await Post.find({
    likes: userId,
    isDeleted: false,
    isArchived: false,
  })
    .select("tags")
    .limit(50);

  const savedPosts = await Post.find({
    savedBy: userId,
    isDeleted: false,
    isArchived: false,
  })
    .select("tags")
    .limit(50);

  const likedReels = await Reel.find({
    likes: userId,
    isDeleted: false,
  })
    .select("hashtags")
    .limit(50);

  const savedReels = await Reel.find({
    savedBy: userId,
    isDeleted: false,
  })
    .select("hashtags")
    .limit(50);

  const tags = [
    ...likedPosts.flatMap((post) => post.tags || []),
    ...savedPosts.flatMap((post) => post.tags || []),
    ...likedReels.flatMap((reel) => reel.hashtags || []),
    ...savedReels.flatMap((reel) => reel.hashtags || []),
  ];

  return [...new Set(tags)].slice(0, 20);
};

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const cacheKey = `recommendations:users:${req.user._id}`;

  const cachedUsers = await getCache(cacheKey);

  if (cachedUsers) {
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cachedUsers, "Suggested users fetched from cache"));
  }

  const currentUser = await User.findById(req.user._id).select("following blockedUsers");

  const excludedUsers = [req.user._id, ...currentUser.following, ...currentUser.blockedUsers];

  const mutualCandidates = await User.find({
    _id: {
      $nin: excludedUsers,
    },
    isDeleted: false,
    isBlockedByAdmin: false,
    blockedUsers: {
      $ne: req.user._id,
    },
    followers: {
      $in: currentUser.following,
    },
  })
    .select(userPublicFields)
    .limit(20);

  const popularCandidates = await User.find({
    _id: {
      $nin: [...excludedUsers, ...mutualCandidates.map((user) => user._id)],
    },
    isDeleted: false,
    isBlockedByAdmin: false,
    blockedUsers: {
      $ne: req.user._id,
    },
  })
    .select(userPublicFields)
    .sort({
      followers: -1,
      createdAt: -1,
    })
    .limit(20);

  const users = [...mutualCandidates, ...popularCandidates].slice(0, 20);

  await setCache(cacheKey, users, 120);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, users, "Suggested users fetched successfully"));
});

export const getRecommendedPosts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const cacheKey = `recommendations:posts:${req.user._id}:page:${page}:limit:${limit}`;

  const cachedPosts = await getCache(cacheKey);

  if (cachedPosts) {
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cachedPosts, "Recommended posts fetched from cache"));
  }

  const currentUser = await User.findById(req.user._id).select("following blockedUsers");
  const visibleAuthorIds = await getVisibleAuthorIds(currentUser, req.user._id);

  const interestTags = await getUserInterestTags(req.user._id);

  const query = {
    author: {
      $in: visibleAuthorIds,
    },
    isDeleted: false,
    isArchived: false,
  };

  if (interestTags.length > 0) {
    query.$or = [
      {
        tags: {
          $in: interestTags,
        },
      },
      {
        author: {
          $in: currentUser.following,
        },
      },
    ];
  }

  const posts = await Post.find(query)
    .populate("author", authorPublicFields)
    .sort({
      likes: -1,
      commentsCount: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  const responseData = {
    posts,
    interestTags,
    pagination: {
      page,
      limit,
      hasMore: posts.length === limit,
    },
  };

  await setCache(cacheKey, responseData, 120);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, responseData, "Recommended posts fetched successfully"));
});

export const getRecommendedReels = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const cacheKey = `recommendations:reels:${req.user._id}:page:${page}:limit:${limit}`;

  const cachedReels = await getCache(cacheKey);

  if (cachedReels) {
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cachedReels, "Recommended reels fetched from cache"));
  }

  const currentUser = await User.findById(req.user._id).select("following blockedUsers");
  const visibleAuthorIds = await getVisibleAuthorIds(currentUser, req.user._id);

  const interestTags = await getUserInterestTags(req.user._id);

  const query = {
    author: {
      $in: visibleAuthorIds,
    },
    isDeleted: false,
  };

  if (interestTags.length > 0) {
    query.$or = [
      {
        hashtags: {
          $in: interestTags,
        },
      },
      {
        author: {
          $in: currentUser.following,
        },
      },
    ];
  }

  const reels = await Reel.find(query)
    .populate("author", authorPublicFields)
    .sort({
      viewsCount: -1,
      likes: -1,
      commentsCount: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  const responseData = {
    reels,
    interestTags,
    pagination: {
      page,
      limit,
      hasMore: reels.length === limit,
    },
  };

  await setCache(cacheKey, responseData, 120);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, responseData, "Recommended reels fetched successfully"));
});

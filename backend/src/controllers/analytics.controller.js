import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import Analytics from "../models/analytics.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Story from "../models/story.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const validateObjectId = (id, message = "Invalid id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }
};

const getDateFilter = (days = 30) => {
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - Number(days));

  return {
    $gte: startDate,
  };
};

export const getCreatorDashboardStats = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;

  const dateFilter = getDateFilter(days);

  const [
    profileVisits,
    postImpressions,
    reelImpressions,
    storyImpressions,
    totalPosts,
    totalReels,
    totalStories,
  ] = await Promise.all([
    Analytics.countDocuments({
      owner: req.user._id,
      type: "profile_visit",
      createdAt: dateFilter,
    }),

    Analytics.countDocuments({
      owner: req.user._id,
      type: "post_impression",
      createdAt: dateFilter,
    }),

    Analytics.countDocuments({
      owner: req.user._id,
      type: "reel_impression",
      createdAt: dateFilter,
    }),

    Analytics.countDocuments({
      owner: req.user._id,
      type: "story_impression",
      createdAt: dateFilter,
    }),

    Post.countDocuments({
      author: req.user._id,
      isDeleted: false,
    }),

    Reel.countDocuments({
      author: req.user._id,
      isDeleted: false,
    }),

    Story.countDocuments({
      author: req.user._id,
      isDeleted: false,
    }),
  ]);

  const totalImpressions = postImpressions + reelImpressions + storyImpressions;

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        days,
        profileVisits,
        postImpressions,
        reelImpressions,
        storyImpressions,
        totalImpressions,
        totalPosts,
        totalReels,
        totalStories,
      },
      "Creator dashboard stats fetched successfully",
    ),
  );
});

export const getPostAnalytics = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  validateObjectId(postId, "Invalid post id");

  const post = await Post.findOne({
    _id: postId,
    author: req.user._id,
    isDeleted: false,
  });

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  const impressions = await Analytics.countDocuments({
    owner: req.user._id,
    post: postId,
    type: "post_impression",
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        impressions,
        likes: post.likes.length,
        comments: post.commentsCount,
        saves: post.savedBy.length,
        engagement:
          impressions > 0
            ? Number(
                (
                  ((post.likes.length + post.commentsCount + post.savedBy.length) / impressions) *
                  100
                ).toFixed(2),
              )
            : 0,
      },
      "Post analytics fetched successfully",
    ),
  );
});

export const getReelAnalytics = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  validateObjectId(reelId, "Invalid reel id");

  const reel = await Reel.findOne({
    _id: reelId,
    author: req.user._id,
    isDeleted: false,
  });

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  const impressions = await Analytics.countDocuments({
    owner: req.user._id,
    reel: reelId,
    type: "reel_impression",
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        impressions,
        views: reel.viewsCount,
        likes: reel.likes.length,
        comments: reel.commentsCount,
        saves: reel.savedBy.length,
        shares: reel.sharesCount,
        engagement:
          impressions > 0
            ? Number(
                (
                  ((reel.likes.length +
                    reel.commentsCount +
                    reel.savedBy.length +
                    reel.sharesCount) /
                    impressions) *
                  100
                ).toFixed(2),
              )
            : 0,
      },
      "Reel analytics fetched successfully",
    ),
  );
});

export const getProfileVisitsAnalytics = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;

  const visits = await Analytics.aggregate([
    {
      $match: {
        owner: req.user._id,
        type: "profile_visit",
        createdAt: getDateFilter(days),
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        visits: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, visits, "Profile visits analytics fetched"));
});

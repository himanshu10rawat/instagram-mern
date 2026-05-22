import { HTTP_STATUS } from "../constants/httpStatus.js";
import Comment from "../models/comment.model.js";
import LiveSession from "../models/liveSession.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Report from "../models/report.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const adminUserFields =
  "username fullName email avatar role accountType isDeleted isBlockedByAdmin createdAt lastLogin";

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getMatchedUserIds = async (search) => {
  if (!search) return [];

  const searchRegex = new RegExp(escapeRegExp(search), "i");
  const users = await User.find({
    $or: [
      { username: searchRegex },
      { email: searchRegex },
      { fullName: searchRegex },
    ],
  })
    .select("_id")
    .limit(100);

  return users.map((user) => user._id);
};

const toCountMap = (counts) => {
  return new Map(counts.map((item) => [item._id.toString(), item.count]));
};

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalPosts,
    totalReels,
    totalLives,
    pendingReports,
    blockedUsers,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Post.countDocuments({ isDeleted: false }),
    Reel.countDocuments({ isDeleted: false }),
    LiveSession.countDocuments({ status: "live" }),
    Report.countDocuments({ status: "pending" }),
    User.countDocuments({ isDeleted: false, isBlockedByAdmin: true }),
  ]);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        totalUsers,
        totalPosts,
        totalReels,
        totalLives,
        pendingReports,
        blockedUsers,
      },
      "Admin dashboard fetched successfully",
    ),
  );
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();
  const filter = { isDeleted: false };

  if (search) {
    const searchRegex = new RegExp(escapeRegExp(search), "i");

    filter.$or = [
      { username: searchRegex },
      { email: searchRegex },
      { fullName: searchRegex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  const userIds = users.map((user) => user._id);
  const [postCounts, reelCounts] = await Promise.all([
    Post.aggregate([
      { $match: { author: { $in: userIds }, isDeleted: false } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]),
    Reel.aggregate([
      { $match: { author: { $in: userIds }, isDeleted: false } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]),
  ]);
  const postCountMap = toCountMap(postCounts);
  const reelCountMap = toCountMap(reelCounts);
  const usersWithActivity = users.map((user) => {
    const userObject = user.toObject();
    const userId = user._id.toString();

    return {
      ...userObject,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      postsCount: postCountMap.get(userId) || 0,
      reelsCount: reelCountMap.get(userId) || 0,
    };
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        users: usersWithActivity,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully",
    ),
  );
});

export const getPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();
  const filter = { isDeleted: false };

  if (search) {
    const searchRegex = new RegExp(escapeRegExp(search), "i");
    const matchedUserIds = await getMatchedUserIds(search);
    const searchFilters = [
      { caption: searchRegex },
      { location: searchRegex },
      { tags: searchRegex },
    ];

    if (matchedUserIds.length > 0) {
      searchFilters.push({ author: { $in: matchedUserIds } });
    }

    filter.$or = searchFilters;
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("author", adminUserFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Posts fetched successfully",
    ),
  );
});

export const getReels = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();
  const filter = { isDeleted: false };

  if (search) {
    const searchRegex = new RegExp(escapeRegExp(search), "i");
    const matchedUserIds = await getMatchedUserIds(search);
    const searchFilters = [
      { caption: searchRegex },
      { location: searchRegex },
      { hashtags: searchRegex },
      { audioName: searchRegex },
    ];

    if (matchedUserIds.length > 0) {
      searchFilters.push({ author: { $in: matchedUserIds } });
    }

    filter.$or = searchFilters;
  }

  const [reels, total] = await Promise.all([
    Reel.find(filter)
      .populate("author", adminUserFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Reel.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        reels,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Reels fetched successfully",
    ),
  );
});

export const getReports = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";
  const filter = status === "all" ? {} : { status };

  const reports = await Report.find(filter)
    .populate("reporter", "username fullName avatar")
    .populate("reportedUser", "username fullName avatar")
    .populate("post")
    .populate("reel")
    .populate("comment")
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, reports, "Reports fetched successfully"));
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  const allowedStatus = ["pending", "reviewed", "resolved", "dismissed"];

  if (!allowedStatus.includes(status)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid report status");
  }

  const report = await Report.findByIdAndUpdate(reportId, { status }, { new: true });

  if (!report) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Report not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, report, "Report status updated successfully"));
});

export const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const report = await Report.findByIdAndDelete(reportId);

  if (!report) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Report not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Report deleted successfully"));
});

export const blockUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isBlockedByAdmin: true },
    { new: true },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, "User blocked by admin successfully"));
});

export const unblockUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isBlockedByAdmin: false },
    { new: true },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, "User unblocked by admin successfully"));
});

export const updateUserRoleByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid user role");
  }

  if (req.user._id.toString() === userId && role !== "admin") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot remove your own admin role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, "User role updated successfully"));
});

export const removePostByAdmin = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findByIdAndUpdate(postId, { isDeleted: true }, { new: true });

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Post removed by admin successfully"));
});

export const removeReelByAdmin = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  const reel = await Reel.findByIdAndUpdate(reelId, { isDeleted: true }, { new: true });

  if (!reel) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reel not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Reel removed by admin successfully"));
});

export const removeCommentByAdmin = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { isDeleted: true },
    { new: true },
  );

  if (!comment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Comment not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Comment removed by admin successfully"));
});

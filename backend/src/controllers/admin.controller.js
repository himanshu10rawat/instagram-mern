import { HTTP_STATUS } from "../constants/httpStatus.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Report from "../models/report.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getReports = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";

  const reports = await Report.find({ status })
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

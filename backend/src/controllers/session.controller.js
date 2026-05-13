import { HTTP_STATUS } from "../constants/httpStatus.js";
import Session from "../models/session.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    user: req.user._id,
    isRevoked: false,
    expiresAt: {
      $gt: new Date(),
    },
  })
    .select("-refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, sessions, "Sessions fetched successfully"));
});

export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  await Session.findOneAndUpdate(
    {
      _id: sessionId,
      user: req.user._id,
    },
    {
      isRevoked: true,
    },
  );

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Session revoked successfully"));
});

export const revokeAllSessions = asyncHandler(async (req, res) => {
  await Session.updateMany(
    {
      user: req.user._id,
      isRevoked: false,
    },
    {
      isRevoked: true,
    },
  );

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "All sessions revoked successfully"));
});

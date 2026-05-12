import { HTTP_STATUS } from "../constants/httpStatus.js";
import LiveSession from "../models/liveSession.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const startLive = asyncHandler(async (req, res) => {
  const { title, channelName } = req.body;

  if (!channelName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Channel name is required");
  }

  const existingLive = await LiveSession.findOne({
    host: req.user._id,
    status: "live",
  });

  if (existingLive) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You are already live");
  }

  const live = await LiveSession.create({
    host: req.user._id,
    title: title || "",
    channelName,
  });

  const populatedLive = await LiveSession.findById(live._id).populate(
    "host",
    "username fullName avatar isVerified",
  );

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, populatedLive, "Live started successfully"));
});

export const getActiveLives = asyncHandler(async (_req, res) => {
  const lives = await LiveSession.find({
    status: "live",
  })
    .populate("host", "username fullName avatar isVerified")
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, lives, "Active lives fetched successfully"));
});

export const joinLive = asyncHandler(async (req, res) => {
  const { liveId } = req.params;

  let live = await LiveSession.findOneAndUpdate(
    {
      _id: liveId,
      status: "live",
      viewers: { $ne: req.user._id },
    },
    {
      $addToSet: {
        viewers: req.user._id,
      },
      $inc: {
        viewersCount: 1,
      },
    },
    {
      new: true,
    },
  ).populate("host", "username fullName avatar isVerified");

  if (!live) {
    live = await LiveSession.findOne({
      _id: liveId,
      status: "live",
    }).populate("host", "username fullName avatar isVerified");

    if (!live) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Live session not found");
    }
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, live, "Joined live successfully"));
});

export const endLive = asyncHandler(async (req, res) => {
  const { liveId } = req.params;

  const live = await LiveSession.findOneAndUpdate(
    {
      _id: liveId,
      host: req.user._id,
      status: "live",
    },
    {
      status: "ended",
      endedAt: new Date(),
    },
    {
      new: true,
    },
  );

  if (!live) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Live session not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, live, "Live ended successfully"));
});

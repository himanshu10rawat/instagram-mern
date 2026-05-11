import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAgoraToken } from "../utils/agoraToken.js";

export const generateRtcToken = asyncHandler(async (req, res) => {
  const { channelName } = req.body;

  if (!channelName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Channel name is required");
  }

  const uid = Number(req.user._id.toString().slice(-6));

  const token = generateAgoraToken({
    channelName,
    uid,
  });

  res.status(HTTP_STATUS.Ok).json(
    new ApiResponse(
      HTTP_STATUS.Ok,
      {
        appId: process.env.AGORA_APP_ID,
        token,
        uid,
        channelName,
      },
      "Agora token generated successfully",
    ),
  );
});

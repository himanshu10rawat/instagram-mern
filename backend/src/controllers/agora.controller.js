import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAgoraToken } from "../utils/agoraToken.js";

const MAX_AGORA_UID = 2 ** 32 - 1;
const CHANNEL_NAME_REGEX = /^[A-Za-z0-9 !#$%&()+\-:;<=.>?@[\]^_{}|~,]{1,64}$/;

const getFallbackUid = (userId) => {
  const uid = parseInt(userId.toString().slice(-8), 16);

  if (Number.isInteger(uid) && uid > 0 && uid <= MAX_AGORA_UID) {
    return uid;
  }

  return Math.floor(Math.random() * MAX_AGORA_UID) + 1;
};

const normalizeUid = (uid, userId) => {
  const numericUid = Number(uid);

  if (Number.isInteger(numericUid) && numericUid > 0 && numericUid <= MAX_AGORA_UID) {
    return numericUid;
  }

  return getFallbackUid(userId);
};

export const generateRtcToken = asyncHandler(async (req, res) => {
  const { channelName, role, uid: requestedUid } = req.body;

  const normalizedChannelName = String(channelName || "").trim();

  if (!normalizedChannelName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Channel name is required");
  }

  if (!CHANNEL_NAME_REGEX.test(normalizedChannelName)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Agora channel name");
  }

  const uid = normalizeUid(requestedUid, req.user._id);

  const tokenData = generateAgoraToken({
    channelName: normalizedChannelName,
    uid,
    role,
  });

  res.status(HTTP_STATUS.Ok).json(
    new ApiResponse(
      HTTP_STATUS.Ok,
      {
        appId: process.env.AGORA_APP_ID,
        token: tokenData.token,
        uid,
        channelName: normalizedChannelName,
        expiresIn: tokenData.expiresIn,
        expiresAt: tokenData.expiresAt,
      },
      "Agora token generated successfully",
    ),
  );
});

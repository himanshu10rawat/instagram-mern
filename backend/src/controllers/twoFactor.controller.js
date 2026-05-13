import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateHashedBackupCodes,
  generateQrCode,
  generateTwoFactorSecret,
  hashBackupCode,
  verifyTwoFactorToken,
} from "../utils/twoFactor.js";

export const setupTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (user.twoFactorEnabled) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "2FA is already enabled");
  }

  const secret = generateTwoFactorSecret({
    username: user.username,
  });

  user.twoFactorSecret = secret.base32;

  await user.save({ validateBeforeSave: false });

  const qrCode = await generateQrCode(secret.otpauth_url);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        secret: secret.base32,
        qrCode,
      },
      "2FA setup generated successfully",
    ),
  );
});

export const enableTwoFactor = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findById(req.user._id).select(
    "+twoFactorSecret +twoFactorBackupCodes.code",
  );

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (!user.twoFactorSecret) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Please setup 2FA first");
  }

  const isValidToken = verifyTwoFactorToken({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValidToken) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid 2FA token");
  }

  const { rawCodes, hashedCodes } = generateHashedBackupCodes();

  user.twoFactorEnabled = true;
  user.twoFactorBackupCodes = hashedCodes;

  await user.save({ validateBeforeSave: false });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        backupCodes: rawCodes,
      },
      "2FA enabled successfully. Save your backup codes safely.",
    ),
  );
});

export const disableTwoFactor = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (!user.twoFactorEnabled) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "2FA is not enabled");
  }

  const isValidToken = verifyTwoFactorToken({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValidToken) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid 2FA token");
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodes = [];

  await user.save({ validateBeforeSave: false });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "2FA disabled successfully"));
});

export const regenerateBackupCodes = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findById(req.user._id).select(
    "+twoFactorSecret +twoFactorBackupCodes.code",
  );

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (!user.twoFactorEnabled) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "2FA is not enabled");
  }

  const isValidToken = verifyTwoFactorToken({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValidToken) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid 2FA token");
  }

  const { rawCodes, hashedCodes } = generateHashedBackupCodes();

  user.twoFactorBackupCodes = hashedCodes;

  await user.save({ validateBeforeSave: false });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        backupCodes: rawCodes,
      },
      "Backup codes regenerated successfully",
    ),
  );
});

export const verifyBackupCode = asyncHandler(async (req, res) => {
  const { backupCode } = req.body;

  const user = await User.findById(req.user._id).select("+twoFactorBackupCodes.code");

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  const hashedCode = hashBackupCode(backupCode);

  const matchedCode = user.twoFactorBackupCodes.find(
    (item) => item.code === hashedCode && !item.used,
  );

  if (!matchedCode) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or used backup code");
  }

  matchedCode.used = true;

  await user.save({ validateBeforeSave: false });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Backup code verified successfully"));
});

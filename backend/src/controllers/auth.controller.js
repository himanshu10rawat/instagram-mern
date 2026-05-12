import jwt from "jsonwebtoken";
import crypto from "crypto";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addEmailJob } from "../queues/email.queue.js";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const buildUserQuery = (identifier) => {
  const normalizedIdentifier = identifier.toLowerCase();

  return {
    $or: [
      { email: normalizedIdentifier },
      { username: normalizedIdentifier },
      { phoneNumber: identifier },
    ],
  };
};

export const register = asyncHandler(async (req, res) => {
  const { username, fullName, email, phoneNumber, password, dateOfBirth, gender, accountType } =
    req.body;

  const duplicateChecks = [{ username }];

  if (email) {
    duplicateChecks.push({ email });
  }

  if (phoneNumber) {
    duplicateChecks.push({ phoneNumber });
  }

  const existingUser = await User.findOne({
    $or: duplicateChecks,
  });

  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Username, email, or phone number already exists");
  }

  const user = await User.create({
    username,
    fullName,
    email,
    phoneNumber,
    password,
    dateOfBirth,
    gender,
    accountType,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires",
  );

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, createdUser, "Account created successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne(buildUserQuery(identifier)).select("+password +refreshToken");

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires",
  );

  const cookieOptions = getCookieOptions();

  res
    .status(HTTP_STATUS.Ok)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: Number(process.env.COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        HTTP_STATUS.Ok,
        {
          user: loggedInUser,
          accessToken,
        },
        "Logged in successfully",
      ),
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true },
  );

  const cookieOptions = getCookieOptions();

  res
    .status(HTTP_STATUS.Ok)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, req.user, "Current user fetched successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Refresh token is required");
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decodedToken.id).select("+refreshToken");

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Refresh token is expired or used");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  const cookieOptions = getCookieOptions();

  res
    .status(HTTP_STATUS.Ok)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: Number(process.env.COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        HTTP_STATUS.Ok,
        {
          accessToken,
        },
        "Access token refreshed successfully",
      ),
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  const user = await User.findOne(buildUserQuery(identifier)).select(
    "+passwordResetToken +passwordResetExpires",
  );

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await addEmailJob({
    to: user.email,
    subject: "Reset your password",
    html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
  `,
    text: `Reset your password using this link: ${resetUrl}`,
  });

  const responseData = process.env.NODE_ENV === "development" ? { resetToken, resetUrl } : null;

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, responseData, "Password reset link sent successfully"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired reset token");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;

  await user.save();

  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Password reset successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Old password is incorrect");
  }

  user.password = newPassword;
  user.refreshToken = undefined;

  await user.save();

  const cookieOptions = getCookieOptions();

  res
    .status(HTTP_STATUS.Ok)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Password changed successfully. Please login"));
});

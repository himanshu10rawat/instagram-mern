import jwt from "jsonwebtoken";
import crypto from "crypto";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { addEmailJob } from "../queues/email.queue.js";
import Session from "../models/session.model.js";
import { createRawToken, hashToken } from "../utils/token.js";
import { emailVerificationTemplate } from "../utils/emailTemplates.js";
import { createSession, getSessionExpiresAt } from "../utils/session.js";
import { verifyTwoFactorToken, hashBackupCode } from "../utils/twoFactor.js";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const getRefreshTokenCookieMaxAge = () => {
  return Number(process.env.COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000;
};

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

  let rawEmailVerificationToken;
  let verificationUrl;

  if (user.email) {
    rawEmailVerificationToken = createRawToken();
    verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawEmailVerificationToken}`;

    user.emailVerificationToken = hashToken(rawEmailVerificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const emailTemplate = emailVerificationTemplate({
      fullName: user.fullName,
      verificationUrl,
    });

    await addEmailJob({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires",
  );

  const responseData =
    process.env.NODE_ENV === "development" && rawEmailVerificationToken
      ? {
          user: createdUser,
          emailVerificationToken: rawEmailVerificationToken,
          verificationUrl,
        }
      : {
          user: createdUser,
        };

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, responseData, "Account created successfully"));
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

  if (user.twoFactorEnabled) {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          requiresTwoFactor: true,
          userId: user._id,
        },
        "2FA verification required",
      ),
    );
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires",
  );

  const cookieOptions = getCookieOptions();

  await createSession({
    userId: user._id,
    refreshToken,
    req,
  });

  res
    .status(HTTP_STATUS.Ok)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenCookieMaxAge(),
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
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    await Session.findOneAndUpdate(
      {
        user: req.user._id,
        refreshToken,
      },
      {
        isRevoked: true,
      },
    );
  }

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

  let decodedToken;

  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken.id).select("+refreshToken");

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
  }

  const session = await Session.findOne({
    user: user._id,
    refreshToken: incomingRefreshToken,
    isRevoked: false,
    expiresAt: {
      $gt: new Date(),
    },
  }).select("+refreshToken");

  if (!session) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Refresh token is expired or used");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  session.refreshToken = refreshToken;
  session.lastUsedAt = new Date();
  session.expiresAt = getSessionExpiresAt();

  await session.save();

  const cookieOptions = getCookieOptions();

  res
    .status(HTTP_STATUS.Ok)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenCookieMaxAge(),
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

  if (!user.email) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This account does not have an email address");
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
  await Session.updateMany({ user: user._id, isRevoked: false }, { isRevoked: true });

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
  await Session.updateMany({ user: user._id, isRevoked: false }, { isRevoked: true });

  const cookieOptions = getCookieOptions();

  res
    .status(HTTP_STATUS.Ok)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(HTTP_STATUS.Ok, null, "Password changed successfully. Please login"));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: {
      $gt: new Date(),
    },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Email verified successfully"));
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+emailVerificationToken +emailVerificationExpires",
  );

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is already verified");
  }

  if (!user.email) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This account does not have an email address");
  }

  const rawEmailVerificationToken = createRawToken();

  user.emailVerificationToken = hashToken(rawEmailVerificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawEmailVerificationToken}`;

  const emailTemplate = emailVerificationTemplate({
    fullName: user.fullName,
    verificationUrl,
  });

  await addEmailJob({
    to: user.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  });

  const responseData =
    process.env.NODE_ENV === "development"
      ? {
          emailVerificationToken: rawEmailVerificationToken,
          verificationUrl,
        }
      : null;

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, responseData, "Verification email sent successfully"));
});

export const verifyLoginTwoFactor = asyncHandler(async (req, res) => {
  const { userId, token, backupCode } = req.body;

  const user = await User.findById(userId).select(
    "+password +refreshToken +twoFactorSecret +twoFactorBackupCodes.code",
  );

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid request");
  }

  let isVerified = false;

  if (token) {
    isVerified = verifyTwoFactorToken({
      token,
      secret: user.twoFactorSecret,
    });
  }

  if (!isVerified && backupCode) {
    const hashedCode = hashBackupCode(backupCode);

    const matchedCode = user.twoFactorBackupCodes.find(
      (item) => item.code === hashedCode && !item.used,
    );

    if (matchedCode) {
      matchedCode.used = true;
      isVerified = true;
    }
  }

  if (!isVerified) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid 2FA token or backup code");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  // Agar tumne session management add kiya hai:
  // await createSession({ userId: user._id, refreshToken, req });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -twoFactorSecret -twoFactorBackupCodes",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful",
      ),
    );
});

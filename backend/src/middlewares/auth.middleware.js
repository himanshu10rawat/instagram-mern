import jwt from "jsonwebtoken";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAuthToken = (req) => {
  return req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
};

const getAuthenticatedUser = async (token) => {
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid access token");
  }

  const user = await User.findById(decodedToken.id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires",
  );

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid access token");
  }

  return user;
};

export const isAuthenticated = asyncHandler(async (req, _res, next) => {
  const token = getAuthToken(req);

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized request");
  }

  req.user = await getAuthenticatedUser(token);
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getAuthToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    req.user = await getAuthenticatedUser(token);
  } catch {
    req.user = undefined;
  }

  next();
});

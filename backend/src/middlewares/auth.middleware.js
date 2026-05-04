import jwt from "jsonwebtoken";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const isAuthenticated = asyncHandler(async (req, _parse, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  const user = await User.findById(decodedToken.id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires",
  );

  if (!user || user.isDeleted || user.isBlockedByAdmin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid access token");
  }

  req.user = user;
  next();
});

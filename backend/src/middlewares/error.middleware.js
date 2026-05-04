import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/httpStatus.js";

export const errorMiddleware = (error, _req, res, _next) => {
  let statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = error.message || "Internal Server Error";
  let errors = error.errors || [];

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation Errors";
    errors = Object.values(error.errors).map((err) => err.message);
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Invalid resource id";
  }

  if (error.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const fields = Object.keys(error.keyValue).join(", ");
    message = `${fields} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

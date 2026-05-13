import crypto from "crypto";

import redis from "../config/redis.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

const hashText = (text = "") => {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
};

export const blockDuplicateContent = ({
  field = "text",
  keyPrefix = "duplicate-content",
  ttlSeconds = 120,
}) => {
  return async (req, _res, next) => {
    const value = req.body[field];

    if (!value) {
      next();
      return;
    }

    const userId = req.user?._id?.toString() || req.ip;
    const key = `${keyPrefix}:${userId}:${hashText(value)}`;

    const exists = await redis.get(key);

    if (exists) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You are repeating the same content. Please wait before posting again.",
      );
    }

    await redis.set(key, "1", "EX", ttlSeconds);

    next();
  };
};

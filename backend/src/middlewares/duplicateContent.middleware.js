import crypto from "crypto";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

const duplicateContentStore = new Map();

const hashText = (text = "") => {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
};

const cleanupExpiredEntries = () => {
  const now = Date.now();

  for (const [key, expiresAt] of duplicateContentStore.entries()) {
    if (expiresAt <= now) {
      duplicateContentStore.delete(key);
    }
  }
};

export const blockDuplicateContent = ({
  field = "text",
  keyPrefix = "duplicate-content",
  ttlSeconds = 120,
}) => {
  return (req, _res, next) => {
    const value = req.body[field];

    if (!value) {
      next();
      return;
    }

    const userId = req.user?._id?.toString() || req.ip;
    const key = `${keyPrefix}:${userId}:${hashText(value)}`;
    const expiresAt = duplicateContentStore.get(key);

    if (expiresAt && expiresAt > Date.now()) {
      next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "You are repeating the same content. Please wait before posting again.",
        ),
      );
      return;
    }

    duplicateContentStore.set(key, Date.now() + ttlSeconds * 1000);

    if (duplicateContentStore.size > 1000) {
      cleanupExpiredEntries();
    }

    next();
  };
};

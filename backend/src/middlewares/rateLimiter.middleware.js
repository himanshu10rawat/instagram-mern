import redis from "../config/redis.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

const memoryStore = new Map();
const redisFailureWarnings = new Set();

const getMemoryCount = ({ key, windowSeconds }) => {
  const now = Date.now();
  const existingEntry = memoryStore.get(key);

  if (!existingEntry || existingEntry.expiresAt <= now) {
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    });

    return 1;
  }

  existingEntry.count += 1;

  return existingEntry.count;
};

const cleanupExpiredMemoryEntries = () => {
  const now = Date.now();

  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
};

export const rateLimiter = ({ keyPrefix, limit = 100, windowSeconds = 60 }) => {
  return async (req, _res, next) => {
    const identifier = req.user?._id?.toString() || req.ip;
    const key = `rate-limit:${keyPrefix}:${identifier}`;

    let currentCount;

    try {
      currentCount = await redis.incr(key);

      if (currentCount === 1) {
        await redis.expire(key, windowSeconds);
      }
    } catch (error) {
      if (!redisFailureWarnings.has(keyPrefix)) {
        console.warn(
          `Redis rate limiter unavailable for ${keyPrefix}; using in-memory fallback:`,
          error.message,
        );
        redisFailureWarnings.add(keyPrefix);
      }

      currentCount = getMemoryCount({ key, windowSeconds });

      if (memoryStore.size > 1000) {
        cleanupExpiredMemoryEntries();
      }
    }

    if (currentCount > limit) {
      next(
        new ApiError(
          HTTP_STATUS.TOO_MANY_REQUESTS,
          `Too many requests. Please try again after ${Math.ceil(windowSeconds / 60)} minutes.`,
        ),
      );
      return;
    }

    next();
  };
};

import redis from "../config/redis.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

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
    } catch {
      next();
      return;
    }

    if (currentCount > limit) {
      next(new ApiError(HTTP_STATUS.BAD_REQUEST, "Too many requests. Please try again later."));
      return;
    }

    next();
  };
};

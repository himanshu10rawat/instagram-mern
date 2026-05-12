import redis from "../config/redis.js";

export const getCache = async (key) => {
  try {
    const cachedData = await redis.get(key);

    if (!cachedData) {
      return null;
    }

    return JSON.parse(cachedData);
  } catch {
    return null;
  }
};

export const setCache = async (key, data, ttl = Number(process.env.CACHE_TTL_SECONDS) || 60) => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch {
    // Cache is an optimization; requests should still work without Redis.
  }
};

export const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch {
    // Cache is an optimization; requests should still work without Redis.
  }
};

export const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Cache is an optimization; requests should still work without Redis.
  }
};

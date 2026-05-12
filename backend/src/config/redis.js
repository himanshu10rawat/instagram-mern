import Redis from "ioredis";

const baseRedisOptions = {
  lazyConnect: true,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }

    return Math.min(times * 200, 1000);
  },
};

export const createRedisClient = (options = {}) => {
  const client = new Redis(process.env.REDIS_URL, {
    ...baseRedisOptions,
    ...options,
  });

  client.on("connect", () => {
    console.log("Redis connected");
  });

  client.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  return client;
};

const redis = createRedisClient({
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
});

export default redis;

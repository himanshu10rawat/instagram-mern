import redis from "../config/redis.js";

const ONLINE_USERS_KEY = "online-users";

export const addUserSocket = async (userId, socketId) => {
  try {
    await redis.hset(ONLINE_USERS_KEY, userId.toString(), socketId);
  } catch {
    // Socket presence is best-effort when Redis is unavailable.
  }
};

export const removeUserSocket = async (socketId) => {
  try {
    const users = await redis.hgetall(ONLINE_USERS_KEY);

    const userEntry = Object.entries(users).find(
      ([, storedSocketId]) => storedSocketId === socketId,
    );

    if (userEntry) {
      await redis.hdel(ONLINE_USERS_KEY, userEntry[0]);
    }
  } catch {
    // Socket presence is best-effort when Redis is unavailable.
  }
};

export const getUserSocket = async (userId) => {
  try {
    return await redis.hget(ONLINE_USERS_KEY, userId.toString());
  } catch {
    return null;
  }
};

export const getOnlineUsers = async () => {
  try {
    return await redis.hkeys(ONLINE_USERS_KEY);
  } catch {
    return [];
  }
};

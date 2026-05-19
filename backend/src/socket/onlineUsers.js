import redis from "../config/redis.js";

const ONLINE_USERS_KEY = "online-users";
const memoryUserSockets = new Map();
const memorySocketUsers = new Map();

const normalizeUserId = (userId) => {
  if (!userId) return "";

  return userId.toString();
};

export const addUserSocket = async (userId, socketId) => {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId || !socketId) return;

  memoryUserSockets.set(normalizedUserId, socketId);
  memorySocketUsers.set(socketId, normalizedUserId);

  try {
    await redis.hset(ONLINE_USERS_KEY, normalizedUserId, socketId);
  } catch {
    // Socket presence is best-effort when Redis is unavailable.
  }
};

export const removeUserSocket = async (socketId) => {
  const memoryUserId = memorySocketUsers.get(socketId);

  if (memoryUserId) {
    memorySocketUsers.delete(socketId);

    if (memoryUserSockets.get(memoryUserId) === socketId) {
      memoryUserSockets.delete(memoryUserId);
    }
  }

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
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) return null;

  try {
    const socketId = await redis.hget(ONLINE_USERS_KEY, normalizedUserId);

    if (socketId) return socketId;
  } catch {
    // Socket presence is best-effort when Redis is unavailable.
  }

  return memoryUserSockets.get(normalizedUserId) || null;
};

export const getOnlineUsers = async () => {
  const memoryUsers = Array.from(memoryUserSockets.keys());

  try {
    const redisUsers = await redis.hkeys(ONLINE_USERS_KEY);

    return Array.from(new Set([...redisUsers, ...memoryUsers]));
  } catch {
    return memoryUsers;
  }
};

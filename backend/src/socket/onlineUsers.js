const memoryUserSockets = new Map();
const memorySocketUsers = new Map();

const normalizeUserId = (userId) => {
  if (!userId) return "";

  return userId.toString();
};

export const addUserSocket = (userId, socketId) => {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId || !socketId) return;

  memoryUserSockets.set(normalizedUserId, socketId);
  memorySocketUsers.set(socketId, normalizedUserId);
};

export const removeUserSocket = (socketId) => {
  const memoryUserId = memorySocketUsers.get(socketId);

  if (memoryUserId) {
    memorySocketUsers.delete(socketId);

    if (memoryUserSockets.get(memoryUserId) === socketId) {
      memoryUserSockets.delete(memoryUserId);
    }
  }
};

export const getUserSocket = (userId) => {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) return null;

  return memoryUserSockets.get(normalizedUserId) || null;
};

export const getOnlineUsers = () => {
  return Array.from(memoryUserSockets.keys());
};

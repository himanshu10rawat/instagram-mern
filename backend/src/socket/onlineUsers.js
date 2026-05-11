const onlineUsers = new Map();

export const addUserSocket = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

export const removeUserSocket = (socketId) => {
  for (const [userId, userSocketId] of onlineUsers.entries()) {
    if (userSocketId === socketId) {
      onlineUsers.delete(userId);
      break;
    }
  }
};

export const getUserSocket = (userId) => {
  return onlineUsers.get(userId.toString());
};

export const getOnlineUsers = () => {
  return [...onlineUsers.keys()];
};

import { Server } from "socket.io";

import { addUserSocket, getOnlineUsers, removeUserSocket } from "./onlineUsers.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", (userId) => {
      addUserSocket(userId, socket.id);

      io.emit("online_users", getOnlineUsers());
    });

    socket.on("typing", ({ conversationId, senderId, receiverId }) => {
      socket.io(receiverId).emit("typing", {
        conversationId,
        senderId,
      });
    });

    socket.on("stop_typing", ({ conversationId, senderId, receiverId }) => {
      socket.to(receiverId).emit("stop_typing", {
        conversationId,
        senderId,
      });
    });

    socket.on("disconnect", () => {
      removeUserSocket(socket.id);

      io.emit("online_users", getOnlineUsers());

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};

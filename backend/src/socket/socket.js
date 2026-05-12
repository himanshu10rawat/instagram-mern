import { Server } from "socket.io";

import { addUserSocket, getOnlineUsers, getUserSocket, removeUserSocket } from "./onlineUsers.js";

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

    socket.on("join", async (userId) => {
      await addUserSocket(userId, socket.id);

      const onlineUsers = await getOnlineUsers();
      io.emit("online_users", onlineUsers);
    });

    socket.on("typing", async ({ conversationId, senderId, receiverId }) => {
      const receiverSocketId = await getUserSocket(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          conversationId,
          senderId,
        });
      }
    });

    socket.on("stop_typing", async ({ conversationId, senderId, receiverId }) => {
      const receiverSocketId = await getUserSocket(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop_typing", {
          conversationId,
          senderId,
        });
      }
    });

    socket.on("join_live", ({ liveId, userId }) => {
      socket.join(liveId);

      socket.to(liveId).emit("live_user_joined", {
        liveId,
        userId,
      });
    });

    socket.on("leave_live", ({ liveId, userId }) => {
      socket.leave(liveId);

      socket.to(liveId).emit("live_user_left", {
        liveId,
        userId,
      });
    });

    socket.on("live_comment", ({ liveId, user, text }) => {
      io.to(liveId).emit("live_comment", {
        liveId,
        user,
        text,
        createdAt: new Date(),
      });
    });

    socket.on("live_reaction", ({ liveId, userId, reaction }) => {
      io.to(liveId).emit("live_reaction", {
        liveId,
        userId,
        reaction,
      });
    });

    socket.on("disconnect", async () => {
      await removeUserSocket(socket.id);

      const onlineUsers = await getOnlineUsers();
      io.emit("online_users", onlineUsers);

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

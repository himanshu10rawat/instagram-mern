import { io } from "socket.io-client";

import { env } from "../config/env";

let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (!socket) {
    socket = io(env.socketUrl, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join", userId);

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

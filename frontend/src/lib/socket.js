import { io } from "socket.io-client";

import { env } from "../config/env";

let socket = null;
let joinedUserId = null;

const emitJoin = () => {
  if (socket?.connected && joinedUserId) {
    socket.emit("join", joinedUserId);
  }
};

export const connectSocket = (userId) => {
  if (!userId) return null;

  joinedUserId = userId;

  if (!socket) {
    socket = io(env.socketUrl, {
      withCredentials: true,
      autoConnect: false,
    });

    socket.on("connect", emitJoin);
  }

  if (!socket.connected) {
    socket.connect();
  } else {
    emitJoin();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.off("connect", emitJoin);
    socket.disconnect();
    socket = null;
  }

  joinedUserId = null;
};

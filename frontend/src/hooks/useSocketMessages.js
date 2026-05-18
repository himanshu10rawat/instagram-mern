import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addRealtimeMessage,
  removeTypingUser,
  setOnlineUsers,
  setTypingUser,
  updateRealtimeMessage,
} from "../features/messages/messageSlice";
import { connectSocket, getSocket } from "../lib/socket";

const useSocketMessages = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = connectSocket(user._id);

    const handleReceiveMessage = (message) => {
      dispatch(addRealtimeMessage(message));
    };

    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    const handleTyping = (payload) => {
      dispatch(setTypingUser(payload));
    };

    const handleStopTyping = (payload) => {
      dispatch(removeTypingUser(payload));
    };

    const handleMessageReaction = (message) => {
      dispatch(updateRealtimeMessage(message));
    };

    const handleMessageEdited = (message) => {
      dispatch(updateRealtimeMessage(message));
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("online_users", handleOnlineUsers);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_reaction", handleMessageReaction);
    socket.on("message_edited", handleMessageEdited);

    return () => {
      const activeSocket = getSocket();

      if (activeSocket) {
        activeSocket.off("receive_message", handleReceiveMessage);
        activeSocket.off("online_users", handleOnlineUsers);
        activeSocket.off("typing", handleTyping);
        activeSocket.off("stop_typing", handleStopTyping);
        activeSocket.off("message_reaction", handleMessageReaction);
        activeSocket.off("message_edited", handleMessageEdited);
      }
    };
  }, [dispatch, user?._id]);
};

export default useSocketMessages;

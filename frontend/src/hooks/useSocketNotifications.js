import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addRealtimeNotification } from "../features/notifications/notificationSlice";
import { connectSocket, getSocket } from "../lib/socket";

const useSocketNotifications = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = connectSocket(user._id);

    const handleNewNotification = (notification) => {
      dispatch(addRealtimeNotification(notification));
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      const activeSocket = getSocket();

      if (activeSocket) {
        activeSocket.off("new_notification", handleNewNotification);
      }
    };
  }, [dispatch, user?._id]);
};

export default useSocketNotifications;

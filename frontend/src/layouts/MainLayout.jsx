import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import MobileBottomNav from "../components/layout/MobileBottomNav";
import MobileTopBar from "../components/layout/MobileTopBar";
import Sidebar from "../components/layout/Sidebar";
import {
  fetchFollowRequests,
  syncFollowRequestsFromNotifications,
} from "../features/follow/followSlice";
import {
  fetchConversations,
  fetchMessageRequests,
} from "../features/messages/messageSlice";
import { fetchNotifications } from "../features/notifications/notificationSlice";
import useSocketMessages from "../hooks/useSocketMessages";
import useSocketNotifications from "../hooks/useSocketNotifications";

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const activeConversation = useSelector(
    (state) => state.messages.activeConversation,
  );

  const isMessagesRoute = location.pathname.startsWith("/messages");
  const isStoryViewerRoute = location.pathname.startsWith("/stories/");
  const isChatRoomOpen = isMessagesRoute && Boolean(activeConversation);
  const isFullHeightMobileRoute = isChatRoomOpen || isStoryViewerRoute;

  useSocketNotifications();
  useSocketMessages();

  useEffect(() => {
    dispatch(fetchFollowRequests());
    dispatch(fetchConversations());
    dispatch(fetchMessageRequests());

    const syncNotifications = async () => {
      const result = await dispatch(fetchNotifications());

      if (fetchNotifications.fulfilled.match(result)) {
        dispatch(syncFollowRequestsFromNotifications(result.payload));
      }
    };

    syncNotifications();
  }, [dispatch]);

  return (
    <div className="min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <MobileTopBar />
      <Sidebar />

      <main
        className={`min-h-dvh pt-14 md:ml-20 md:pt-0 md:pb-0 xl:ml-64 ${
          isFullHeightMobileRoute
            ? "overflow-hidden pb-0 md:overflow-visible"
            : "pb-[calc(5rem+env(safe-area-inset-bottom))]"
        } ${
          isMessagesRoute || isStoryViewerRoute
            ? "overflow-hidden md:overflow-visible"
            : ""
        }`}
      >
        <div
          className={`mx-auto w-full max-w-7xl ${
            isFullHeightMobileRoute
              ? "h-[calc(100dvh-3.5rem)] min-h-0 px-0 py-0 md:h-auto md:min-h-dvh md:px-4 md:py-4"
              : isMessagesRoute
                ? "h-[calc(100dvh-8.5rem-env(safe-area-inset-bottom))] min-h-0 px-0 py-0 md:h-auto md:min-h-dvh md:px-4 md:py-4"
                : "min-h-[calc(100dvh-8.5rem-env(safe-area-inset-bottom))] px-3 py-3 sm:px-4 sm:py-4 md:min-h-dvh"
          }`}
        >
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;

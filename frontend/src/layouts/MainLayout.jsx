import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import MobileBottomNav from "../components/layout/MobileBottomNav";
import MobileTopBar from "../components/layout/MobileTopBar";
import Sidebar from "../components/layout/Sidebar";
import {
  fetchConversations,
  fetchMessageRequests,
} from "../features/messages/messageSlice";
import { fetchNotifications } from "../features/notifications/notificationSlice";
import useSocketMessages from "../hooks/useSocketMessages";
import useSocketNotifications from "../hooks/useSocketNotifications";

const MainLayout = () => {
  const dispatch = useDispatch();

  useSocketNotifications();
  useSocketMessages();

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchConversations());
    dispatch(fetchMessageRequests());
  }, [dispatch]);

  return (
    <div className="min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <MobileTopBar />
      <Sidebar />

      <main className="min-h-dvh pt-14 pb-[calc(5rem_+_env(safe-area-inset-bottom))] md:ml-20 md:pt-0 md:pb-0 xl:ml-64">
        <div className="mx-auto min-h-dvh w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;

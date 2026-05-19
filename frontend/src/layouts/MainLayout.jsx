import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import MobileBottomNav from "../components/layout/MobileBottomNav";
import Sidebar from "../components/layout/Sidebar";
import { fetchNotifications } from "../features/notifications/notificationSlice";
import useSocketMessages from "../hooks/useSocketMessages";
import useSocketNotifications from "../hooks/useSocketNotifications";

const MainLayout = () => {
  const dispatch = useDispatch();

  useSocketNotifications();
  useSocketMessages();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <Sidebar />

      <main className="min-h-dvh pb-[calc(5rem_+_env(safe-area-inset-bottom))] lg:ml-64 lg:pb-0">
        <div className="mx-auto min-h-dvh w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;

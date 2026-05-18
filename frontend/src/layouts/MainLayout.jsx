import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import MobileNavbar from "../components/layout/MobileNavbar";
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
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <Sidebar />

      <main className="min-h-screen pb-20 lg:ml-64 lg:pb-0">
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <MobileNavbar />
    </div>
  );
};

export default MainLayout;

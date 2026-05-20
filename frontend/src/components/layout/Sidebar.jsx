import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser, logoutLocally } from "../../features/auth/authSlice";
import { adminNavItems, navItems } from "./navigationItems";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);
  const unreadNotifications = useSelector(
    (state) => state.notifications.unreadCount,
  );
  const unreadMessages = useSelector((state) => state.messages.unreadCount);
  const pendingFollowRequests = useSelector(
    (state) => state.follow.requests.length,
  );

  const isAdmin = currentUser?.role === "admin" || currentUser?.isAdmin;
  const finalNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser());

      if (result?.meta?.requestStatus === "rejected") {
        dispatch(logoutLocally());
      }

      navigate("/login");
    } catch {
      dispatch(logoutLocally());
      navigate("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col border-r border-slate-200 bg-white px-3 py-5 dark:border-slate-800 dark:bg-slate-950 md:flex xl:w-64 xl:px-4 xl:py-6">
      <h1 className="shrink-0 px-2 text-center text-xl font-bold tracking-tight text-slate-950 dark:text-white xl:px-3 xl:text-left xl:text-2xl">
        <span className="xl:hidden">IG</span>
        <span className="hidden xl:inline">Instagram</span>
      </h1>

      <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5 xl:mt-8 xl:pr-1">
        {finalNavItems.map((item) => {
          const Icon = item.icon;
          const showNotificationBadge =
            item.path === "/notifications" && unreadNotifications > 0;
          const showMessageBadge =
            item.path === "/messages" && unreadMessages > 0;
          const showRequestBadge =
            item.path === "/follow-requests" && pendingFollowRequests > 0;
          const badgeCount = showNotificationBadge
            ? unreadNotifications
            : showMessageBadge
              ? unreadMessages
              : pendingFollowRequests;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                `flex min-h-12 items-center justify-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition xl:justify-start ${
                  isActive
                    ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <span className="relative shrink-0">
                <Icon size={22} />

                {showNotificationBadge || showMessageBadge || showRequestBadge ? (
                  <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white xl:hidden">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                ) : null}
              </span>

              <span className="hidden min-w-0 flex-1 items-center justify-between xl:flex">
                <span className="truncate">{item.label}</span>

                {showNotificationBadge || showMessageBadge || showRequestBadge ? (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-3 flex min-h-12 shrink-0 items-center justify-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30 xl:justify-start"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut size={22} />
        <span className="hidden xl:inline">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;

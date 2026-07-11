import { Bell, LogOut, Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";

import Avatar from "../common/Avatar";
import { logoutUser, logoutLocally } from "../../features/auth/authSlice";
import { adminNavItems, navItems } from "./navigationItems";

const MobileTopBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const unreadNotifications = useSelector(
    (state) => state.notifications.unreadCount,
  );
  const unreadMessages = useSelector((state) => state.messages.unreadCount);
  const pendingFollowRequests = useSelector(
    (state) => state.follow.requests.length,
  );

  const isAdmin = currentUser?.role === "admin" || currentUser?.isAdmin;

  const drawerItems = useMemo(() => {
    return isAdmin ? [...navItems, ...adminNavItems] : navItems;
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser());

      if (result?.meta?.requestStatus === "rejected") {
        dispatch(logoutLocally());
      }

      setIsOpen(false);
      navigate("/login");
    } catch {
      dispatch(logoutLocally());
      setIsOpen(false);
      navigate("/login");
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-slate-950 dark:text-white"
        >
          pixelFeed
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Bell size={22} />

            {unreadNotifications > 0 ? (
              <span className="absolute right-0 top-0 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-60 bg-black/45 md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Close menu"
          />

          <aside className="relative ml-auto flex h-full w-[min(23rem,92vw)] flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="shrink-0 border-b border-slate-200 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/profile/me"
                  onClick={() => setIsOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <Avatar
                    src={currentUser?.avatar?.url}
                    alt={currentUser?.username}
                    size="md"
                  />

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">
                      {currentUser?.username || "Profile"}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {currentUser?.fullName || "View profile"}
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <div className="grid gap-1">
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const showNotificationBadge =
                    item.path === "/notifications" && unreadNotifications > 0;
                  const showMessageBadge =
                    item.path === "/messages" && unreadMessages > 0;
                  const showRequestBadge =
                    item.path === "/follow-requests" &&
                    pendingFollowRequests > 0;
                  const badgeCount = showNotificationBadge
                    ? unreadNotifications
                    : showMessageBadge
                      ? unreadMessages
                      : pendingFollowRequests;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                        }`
                      }
                    >
                      <Icon size={21} />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>

                      {showNotificationBadge ||
                      showMessageBadge ||
                      showRequestBadge ? (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/70 dark:hover:bg-red-950/30"
              >
                <LogOut size={21} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default MobileTopBar;

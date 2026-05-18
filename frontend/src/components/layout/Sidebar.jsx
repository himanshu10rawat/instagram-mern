import {
  Bell,
  Clapperboard,
  Compass,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  Settings,
  User,
  UserPlus,
  Archive,
  Bookmark,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logoutUser } from "../../features/auth/authSlice";

const navItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Explore",
    path: "/explore",
    icon: Compass,
  },
  {
    label: "Reels",
    path: "/reels",
    icon: Clapperboard,
  },
  {
    label: "Messages",
    path: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Create",
    path: "/create",
    icon: PlusSquare,
  },
  {
    label: "Profile",
    path: "/profile/me",
    icon: User,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    label: "Requests",
    path: "/follow-requests",
    icon: UserPlus,
  },
  {
    label: "Saved",
    path: "/saved",
    icon: Bookmark,
  },
  {
    label: "Archive",
    path: "/archive",
    icon: Archive,
  },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const unreadNotifications = useSelector(
    (state) => state.notifications.unreadCount,
  );

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <h1 className="shrink-0 px-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
        Instagram
      </h1>

      <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Icon size={22} />
              <span className="flex flex-1 items-center justify-between">
                <span>{item.label}</span>

                {item.label === "Notifications" && unreadNotifications > 0 ? (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
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
        className="mt-3 flex shrink-0 items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <LogOut size={22} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;

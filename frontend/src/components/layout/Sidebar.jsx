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
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

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
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <h1 className="px-3 text-2xl font-bold tracking-tight text-slate-950">
        Instagram
      </h1>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="absolute bottom-6 left-4 right-4 flex items-center gap-4 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={22} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;

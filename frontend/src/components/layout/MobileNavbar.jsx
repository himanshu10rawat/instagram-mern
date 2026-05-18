import {
  Clapperboard,
  Home,
  MessageCircle,
  PlusSquare,
  Search,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    path: "/",
    icon: Home,
  },
  {
    path: "/search",
    icon: Search,
  },
  {
    path: "/create",
    icon: PlusSquare,
  },
  {
    path: "/reels",
    icon: Clapperboard,
  },
  {
    path: "/messages",
    icon: MessageCircle,
  },
  {
    path: "/profile/me",
    icon: User,
  },
];

const MobileNavbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-xl p-2 transition ${
                isActive
                  ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`
            }
          >
            <Icon size={23} />
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNavbar;

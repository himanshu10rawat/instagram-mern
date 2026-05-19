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
    label: "Home",
    path: "/",
    icon: Home,
    end: true,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Create",
    path: "/create",
    icon: PlusSquare,
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
    label: "Profile",
    path: "/profile/me",
    icon: User,
  },
];

const MobileBottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pt-2 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                `flex min-h-12 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Icon size={23} strokeWidth={2.2} />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import { mobilePrimaryPaths, navItems } from "./navigationItems";

const mobileNavItems = navItems.filter((item) =>
  mobilePrimaryPaths.has(item.path),
);

const MobileBottomNav = () => {
  const unreadMessages = useSelector((state) => state.messages.unreadCount);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pt-1.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                  isActive
                    ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <span className="relative">
                <Icon size={23} strokeWidth={2.2} />

                {item.path === "/messages" && unreadMessages > 0 ? (
                  <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </span>

              <span className="max-w-full truncate text-[10px] font-medium leading-3">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

import { Bookmark, Clapperboard, Grid3X3 } from "lucide-react";

const getTabs = (isMyProfile) => {
  const tabs = [
    {
      label: "Posts",
      value: "posts",
      icon: Grid3X3,
    },
    {
      label: "Reels",
      value: "reels",
      icon: Clapperboard,
    },
  ];

  if (isMyProfile) {
    tabs.push({
      label: "Saved",
      value: "saved",
      icon: Bookmark,
    });
  }

  return tabs;
};

const ProfileTabs = ({ activeTab, isMyProfile, onTabChange }) => {
  const tabs = getTabs(isMyProfile);

  return (
    <div className="border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-center gap-2 sm:gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`flex items-center gap-2 border-t-2 px-4 py-4 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? "border-slate-950 text-slate-950 dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;

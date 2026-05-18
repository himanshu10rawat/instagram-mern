import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";

const StoryBar = () => {
  const { storyGroups, loading } = useSelector((state) => state.stories);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-500">Loading stories...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-semibold">Stories</h2>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {storyGroups.length === 0 ? (
          <p className="text-sm text-slate-500">No stories available.</p>
        ) : (
          storyGroups.map((storyGroup) => {
            const user = storyGroup.author || storyGroup.user || {};
            const firstStory = storyGroup.stories?.[0] || storyGroup;

            return (
              <Link
                key={user._id || firstStory._id}
                to={`/stories/${firstStory._id}`}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <Avatar
                  src={user.avatar?.url}
                  alt={user.username}
                  size="lg"
                  ring
                />
                <span className="max-w-16 truncate text-xs text-slate-500">
                  {user.username || "story"}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StoryBar;

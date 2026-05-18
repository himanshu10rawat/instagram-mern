import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";

const getGroupUser = (group) =>
  group.user || group.author || group.stories?.[0]?.author;

const StoryTray = ({ storyGroups = [], currentUser }) => {
  const currentUserId = currentUser?._id;
  const ownStoryGroup = storyGroups.find((group) => {
    const user = getGroupUser(group);
    return user?._id === currentUserId;
  });
  const ownStoryUser = getGroupUser(ownStoryGroup);
  const ownFirstStory = ownStoryGroup?.stories?.[0];
  const ownStoryPath = ownFirstStory
    ? `/stories/${ownFirstStory._id}`
    : "/create?type=story";
  const ownAvatarUrl = currentUser?.avatar?.url || ownStoryUser?.avatar?.url;
  const visibleStoryGroups = storyGroups.filter((group) => {
    if (!currentUserId) return true;

    const user = getGroupUser(group);
    return user?._id !== currentUserId;
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="relative">
            <Link
              to={ownStoryPath}
              aria-label={ownFirstStory ? "View your story" : "Add story"}
            >
              <Avatar
                src={ownAvatarUrl}
                alt={currentUser?.username || ownStoryUser?.username}
                size="lg"
                ring
              />
            </Link>

            <Link
              to="/create?type=story"
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-white dark:border-slate-950"
              aria-label="Add another story"
            >
                <Plus size={14} />
            </Link>
          </div>

          <Link
            to={ownStoryPath}
            className="max-w-20 truncate text-xs text-slate-700 dark:text-slate-300"
          >
            Your story
          </Link>
        </div>

        {visibleStoryGroups.map((group) => {
          const firstStory = group.stories?.[0];
          const user = getGroupUser(group);

          if (!firstStory) return null;

          return (
            <Link
              key={user?._id || firstStory._id}
              to={`/stories/${firstStory._id}`}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <Avatar
                src={user?.avatar?.url}
                alt={user?.username}
                size="lg"
                ring
              />

              <span className="max-w-20 truncate text-xs text-slate-700 dark:text-slate-300">
                {user?.username || "story"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StoryTray;

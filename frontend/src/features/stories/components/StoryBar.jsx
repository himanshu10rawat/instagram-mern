import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";

import Avatar from "../../../components/common/Avatar";
import EmptyState from "../../../components/ui/EmptyState";
import { StoryTraySkeleton } from "../../../components/ui/Skeleton";
import { getStoryRingTone } from "../storyViewStatus";

const StoryBar = () => {
  const location = useLocation();
  const { storyGroups, loading } = useSelector((state) => state.stories);
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const storyReturnState = {
    storyReturnTo: `${location.pathname}${location.search}`,
  };

  if (loading) {
    return <StoryTraySkeleton count={5} />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-semibold">Stories</h2>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {storyGroups.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No stories available"
            description="Stories from people you follow will appear here."
            variant="inline"
            size="sm"
          />
        ) : (
          storyGroups.map((storyGroup) => {
            const user = storyGroup.author || storyGroup.user || {};
            const firstStory = storyGroup.stories?.[0] || storyGroup;
            const stories = storyGroup.stories || [firstStory];

            return (
              <Link
                key={user._id || firstStory._id}
                to={`/stories/${firstStory._id}`}
                state={storyReturnState}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <Avatar
                  src={user.avatar?.url}
                  alt={user.username}
                  size="lg"
                  ring
                  ringTone={getStoryRingTone({
                    authorId: user?._id,
                    currentUserId,
                    stories,
                  })}
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

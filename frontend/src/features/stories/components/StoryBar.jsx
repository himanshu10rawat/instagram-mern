import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { viewStory } from "../storySlice";

const StoryBar = () => {
  const dispatch = useDispatch();
  const { stories, loading } = useSelector((state) => state.stories);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">Loading stories...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Stories</h2>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {stories.length === 0 ? (
          <p className="text-sm text-slate-500">No stories available.</p>
        ) : (
          stories.map((storyGroup) => {
            const user = storyGroup.author || storyGroup.user || {};
            const firstStory = storyGroup.stories?.[0] || storyGroup;

            return (
              <button
                key={user._id || firstStory._id}
                type="button"
                onClick={() => dispatch(viewStory(firstStory._id))}
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
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StoryBar;

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";

import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Input from "../../../components/ui/Input";
import ModalShell from "../../../components/ui/ModalShell";
import { createHighlight } from "../highlightSlice";

const getStoryThumb = (story) => {
  return (
    story?.media?.thumbnailUrl ||
    story?.media?.optimizedUrl ||
    story?.media?.url
  );
};

const isActiveStory = (story) => {
  return new Date(story?.expiresAt || 0).getTime() > Date.now();
};

const CreateHighlightModal = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const { archivedStories, actionLoading } = useSelector(
    (state) => state.highlights,
  );

  const [title, setTitle] = useState("");
  const [selectedStoryIds, setSelectedStoryIds] = useState([]);

  const canSubmit = useMemo(() => {
    return title.trim() && selectedStoryIds.length > 0;
  }, [selectedStoryIds.length, title]);

  if (!open) {
    return null;
  }

  const handleToggleStory = (storyId) => {
    setSelectedStoryIds((prev) => {
      if (prev.includes(storyId)) {
        return prev.filter((id) => id !== storyId);
      }

      return [...prev, storyId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    const result = await dispatch(
      createHighlight({
        title: title.trim(),
        storyIds: selectedStoryIds,
      }),
    );

    if (createHighlight.fulfilled.match(result)) {
      setTitle("");
      setSelectedStoryIds([]);
      onClose();
    }
  };

  return (
    <ModalShell title="Create Highlight" onClose={onClose} className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5 p-4">
        <Input
          label="Highlight title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Travel, Gym, Coding..."
        />

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">
            Select stories
          </p>

          {archivedStories.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No stories found"
              description="Create a story first, then add it to highlights."
              variant="subtle"
              size="sm"
            />
          ) : (
            <div className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {archivedStories.map((story) => {
                const isSelected = selectedStoryIds.includes(story._id);
                const thumb = getStoryThumb(story);
                const storyIsActive = isActiveStory(story);

                return (
                  <button
                    key={story._id}
                    type="button"
                    onClick={() => handleToggleStory(story._id)}
                    className={`relative aspect-9/16 overflow-hidden rounded-xl border-2 ${
                      isSelected
                        ? "border-slate-950 dark:border-white"
                        : "border-transparent"
                    }`}
                  >
                    {story.media?.type === "video" ? (
                      <video
                        src={thumb}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={thumb}
                        alt={story.caption || "Story"}
                        className="h-full w-full object-cover"
                      />
                    )}

                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white ${
                        storyIsActive ? "bg-emerald-500" : "bg-slate-950/80"
                      }`}
                    >
                      {storyIsActive ? "Current" : "Archived"}
                    </span>

                    {isSelected ? (
                      <span className="absolute right-2 top-2 rounded-full bg-slate-950 px-2 py-1 text-xs font-bold text-white">
                        Selected
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button type="submit" disabled={!canSubmit || actionLoading}>
          {actionLoading ? "Creating..." : "Create Highlight"}
        </Button>
      </form>
    </ModalShell>
  );
};

export default CreateHighlightModal;

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { createHighlight } from "../highlightSlice";

const getStoryThumb = (story) => {
  return (
    story?.media?.thumbnailUrl ||
    story?.media?.optimizedUrl ||
    story?.media?.url
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-950"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Create Highlight
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Close create highlight modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-4">
          <Input
            label="Highlight title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Travel, Gym, Coding..."
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">
              Select archived stories
            </p>

            {archivedStories.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-6 text-center dark:border-slate-800">
                <p className="text-sm text-slate-500">
                  No archived stories found.
                </p>
              </div>
            ) : (
              <div className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                {archivedStories.map((story) => {
                  const isSelected = selectedStoryIds.includes(story._id);
                  const thumb = getStoryThumb(story);

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
                          alt={story.caption || "Archived story"}
                          className="h-full w-full object-cover"
                        />
                      )}

                      {isSelected ? (
                        <span className="absolute right-2 top-2 rounded-full bg-slate-950 px-2 py-1 text-xs font-bold text-white">
                          ✓
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
        </div>
      </form>
    </div>
  );
};

export default CreateHighlightModal;

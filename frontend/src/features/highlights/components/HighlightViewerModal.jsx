import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";

const getStoryMediaUrl = (story) => {
  return (
    story?.media?.optimizedUrl ||
    story?.media?.url ||
    story?.media?.thumbnailUrl
  );
};

const HighlightViewerModal = ({ highlight, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const stories = useMemo(() => {
    return highlight?.stories || [];
  }, [highlight?.stories]);

  if (!highlight) {
    return null;
  }

  const activeStory = stories[activeIndex];
  const mediaUrl = getStoryMediaUrl(activeStory);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <article className="relative h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-black text-white">
        <div className="absolute left-0 right-0 top-0 z-20 p-4">
          <div className="flex gap-1">
            {stories.map((story, index) => (
              <span
                key={story._id}
                className={`h-1 flex-1 rounded-full ${
                  index <= activeIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <h2 className="truncate text-sm font-semibold">
              {highlight.title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-black/40 p-2"
              aria-label="Close highlight"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {mediaUrl ? (
          activeStory?.media?.type === "video" ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={highlight.title}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-white/70">No story media found.</p>
          </div>
        )}

        {stories.length > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 rounded-full bg-black/40 p-2"
              aria-label="Previous story"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 rounded-full bg-black/40 p-2"
              aria-label="Next story"
            >
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}
      </article>
    </div>
  );
};

export default HighlightViewerModal;

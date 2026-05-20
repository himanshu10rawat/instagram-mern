import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const getMediaUrl = (media) => media?.optimizedUrl || media?.url || "";

const PostMediaCarousel = ({ media = [], alt = "Post", variant = "feed" }) => {
  const mediaItems = useMemo(
    () => (Array.isArray(media) ? media.filter((item) => getMediaUrl(item)) : []),
    [media],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMedia =
    mediaItems[Math.min(activeIndex, Math.max(mediaItems.length - 1, 0))];
  const hasMultipleMedia = mediaItems.length > 1;
  const isDetail = variant === "detail";

  const goToMedia = (event, nextIndex) => {
    event.stopPropagation();
    setActiveIndex((nextIndex + mediaItems.length) % mediaItems.length);
  };

  if (!activeMedia) {
    return (
      <div
        className={
          isDetail
            ? "flex min-h-80 items-center justify-center bg-black sm:min-h-130"
            : "aspect-square w-full bg-slate-100 dark:bg-slate-900"
        }
      />
    );
  }

  return (
    <div
      className={
        isDetail
          ? "relative flex min-h-80 items-center justify-center bg-black sm:min-h-130"
          : "relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
      }
    >
      {activeMedia.type === "video" ? (
        <video
          key={activeMedia.publicId || activeMedia.url}
          src={getMediaUrl(activeMedia)}
          controls
          preload="metadata"
          poster={activeMedia.thumbnailUrl}
          className={
            isDetail
              ? "max-h-190 w-full object-contain"
              : "h-full w-full object-cover object-top"
          }
        />
      ) : (
        <img
          key={activeMedia.publicId || activeMedia.url}
          src={getMediaUrl(activeMedia)}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={
            isDetail
              ? "max-h-190 w-full object-contain"
              : "h-full w-full object-cover object-top"
          }
        />
      )}

      {hasMultipleMedia ? (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
            {activeIndex + 1}/{mediaItems.length}
          </span>

          <button
            type="button"
            onClick={(event) => goToMedia(event, activeIndex - 1)}
            className="absolute left-3 top-1/2 flex min-h-0 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/70"
            aria-label="Previous media"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={(event) => goToMedia(event, activeIndex + 1)}
            className="absolute right-3 top-1/2 flex min-h-0 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/70"
            aria-label="Next media"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {mediaItems.map((item, index) => (
              <button
                key={item.publicId || item.url}
                type="button"
                onClick={(event) => goToMedia(event, index)}
                className={`h-2 rounded-full transition ${
                  index === activeIndex ? "w-4 bg-white" : "w-2 bg-white/55"
                }`}
                aria-label={`Show media ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default PostMediaCarousel;

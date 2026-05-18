import { Link } from "react-router-dom";

const MediaGrid = ({ items = [], type = "post" }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No {type}s found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {items.map((item) => {
        const isReel = type === "reel" || Boolean(item.video);
        const media = isReel
          ? item.video || item.media
          : item.media?.[0] || item.media;
        const path = isReel ? `/reels/${item._id}` : `/posts/${item._id}`;

        return (
          <Link
            key={item._id}
            to={path}
            className="aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900"
          >
            {media?.type === "video" || isReel ? (
              <video
                src={media?.thumbnailUrl || media?.optimizedUrl || media?.url}
                className="h-full w-full object-cover"
                muted
              />
            ) : (
              <img
                src={media?.thumbnailUrl || media?.optimizedUrl || media?.url}
                alt={item.caption || type}
                className="h-full w-full object-cover"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default MediaGrid;

import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "../../../components/ui/EmptyState";

const MediaGrid = ({ items = [], type = "post" }) => {
  if (!items.length) {
    return (
      <EmptyState
        icon={ImageOff}
        title={`No ${type}s found`}
        description="Try a different search or check back later."
        variant="subtle"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
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

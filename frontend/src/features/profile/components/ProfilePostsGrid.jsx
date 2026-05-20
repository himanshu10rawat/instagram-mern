import { Clapperboard, Images } from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "../../../components/ui/EmptyState";
import { GridSkeleton } from "../../../components/ui/Skeleton";

const getMedia = (item, type) => {
  if (type === "reels") {
    const video = item.video || item.media;

    return {
      thumbnailUrl: video?.thumbnailUrl || "",
      videoUrl: video?.optimizedUrl || video?.url || "",
      mediaType: "video",
    };
  }

  const media = item.media?.[0];

  return {
    imageUrl: media?.thumbnailUrl || media?.optimizedUrl || media?.url || "",
    thumbnailUrl: media?.thumbnailUrl || "",
    videoUrl: media?.optimizedUrl || media?.url || "",
    mediaType: media?.type || "image",
  };
};

const getItemUrl = (item, type) => {
  if (type === "reels") {
    return `/reels/${item._id}`;
  }

  return `/posts/${item._id}`;
};

const getEmptyContent = (type) => {
  if (type === "reels") {
    return {
      title: "No reels yet",
      description: "Reels will appear here after creation.",
    };
  }

  if (type === "saved") {
    return {
      title: "No saved posts",
      description: "Saved posts will appear here.",
    };
  }

  return {
    title: "No posts yet",
    description: "Posts will appear here after creation.",
  };
};

const ProfilePostsGrid = ({ items = [], type = "posts", loading = false }) => {
  if (loading) {
    return <GridSkeleton count={9} />;
  }

  if (!items.length) {
    const emptyContent = getEmptyContent(type);

    return (
      <EmptyState
        icon={type === "reels" ? Clapperboard : Images}
        title={emptyContent.title}
        description={emptyContent.description}
        iconTone={type === "saved" ? "blue" : "slate"}
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {items.map((item) => {
        const media = getMedia(item, type);
        const itemUrl = getItemUrl(item, type);
        const isCarousel = type !== "reels" && item.media?.length > 1;

        return (
          <Link
            key={item._id}
            to={itemUrl}
            className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900"
          >
            {media.mediaType === "video" ? (
              <video
                src={media.videoUrl}
                poster={media.thumbnailUrl}
                preload="metadata"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                muted
                playsInline
              />
            ) : (
              <img
                src={media.imageUrl}
                alt={item.caption || "Profile media"}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            )}

            {type === "reels" ? (
              <span className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">
                <Clapperboard size={16} />
              </span>
            ) : null}

            {isCarousel ? (
              <span className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">
                <Images size={16} />
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
};

export default ProfilePostsGrid;

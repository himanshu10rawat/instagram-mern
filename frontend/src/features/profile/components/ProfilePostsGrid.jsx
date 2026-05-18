import { Clapperboard, Images } from "lucide-react";
import { Link } from "react-router-dom";

const getMedia = (item, type) => {
  if (type === "reels") {
    return {
      url:
        item.video?.thumbnailUrl || item.video?.optimizedUrl || item.video?.url,
      mediaType: "video",
    };
  }

  const media = item.media?.[0];

  return {
    url: media?.thumbnailUrl || media?.optimizedUrl || media?.url,
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
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!items.length) {
    const emptyContent = getEmptyContent(type);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
          {emptyContent.title}
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {emptyContent.description}
        </p>
      </div>
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
                src={media.url}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                muted
                playsInline
              />
            ) : (
              <img
                src={media.url}
                alt={item.caption || "Profile media"}
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

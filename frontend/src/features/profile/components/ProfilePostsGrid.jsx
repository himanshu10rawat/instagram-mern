import { Link } from "react-router-dom";

const ProfilePostsGrid = ({ posts = [] }) => {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
          No posts yet
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Posts will appear here after creation.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {posts.map((post) => {
        const media = post.media?.[0];

        return (
          <Link
            key={post._id}
            to={`/posts/${post._id}`}
            className="aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900"
          >
            {media?.type === "video" ? (
              <video
                src={media.thumbnailUrl || media.optimizedUrl || media.url}
                className="h-full w-full object-cover"
                muted
              />
            ) : (
              <img
                src={media?.thumbnailUrl || media?.optimizedUrl || media?.url}
                alt={post.caption || "Post"}
                className="h-full w-full object-cover"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default ProfilePostsGrid;

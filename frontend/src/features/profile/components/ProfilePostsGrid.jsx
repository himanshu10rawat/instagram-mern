const ProfilePostsGrid = ({ posts = [] }) => {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-950">No posts yet</h2>
        <p className="mt-2 text-sm text-slate-500">
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
          <div
            key={post._id}
            className="aspect-square overflow-hidden bg-slate-100"
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
          </div>
        );
      })}
    </div>
  );
};

export default ProfilePostsGrid;

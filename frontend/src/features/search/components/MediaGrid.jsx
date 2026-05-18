const MediaGrid = ({ items = [], type = "post" }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No {type}s found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {items.map((item) => {
        const media =
          type === "reel"
            ? item.video || item.media
            : item.media?.[0] || item.media;

        return (
          <div
            key={item._id}
            className="aspect-square overflow-hidden rounded-lg bg-slate-100"
          >
            {media?.type === "video" || type === "reel" ? (
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
          </div>
        );
      })}
    </div>
  );
};

export default MediaGrid;

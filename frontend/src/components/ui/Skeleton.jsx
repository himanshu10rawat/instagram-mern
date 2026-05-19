export const SkeletonBlock = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
};

const getItems = (count) => Array.from({ length: count });

export const FeedSkeleton = ({ count = 2 }) => {
  return (
    <div className="space-y-6">
      {getItems(count).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-center gap-3 p-4">
            <SkeletonBlock className="h-11 w-11 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>

          <SkeletonBlock className="aspect-square w-full rounded-none" />

          <div className="space-y-3 p-4">
            <div className="flex justify-between">
              <SkeletonBlock className="h-7 w-28" />
              <SkeletonBlock className="h-7 w-7" />
            </div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-3/4" />
          </div>
        </article>
      ))}
    </div>
  );
};

export const GridSkeleton = ({ count = 9, className = "" }) => {
  return (
    <div className={`grid grid-cols-3 gap-1 sm:gap-4 ${className}`}>
      {getItems(count).map((_, index) => (
        <SkeletonBlock key={index} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
};

export const ListSkeleton = ({ count = 5, withActions = false }) => {
  return (
    <div className="space-y-3">
      {getItems(count).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl">
          <SkeletonBlock className="h-11 w-11 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-48 max-w-full" />
          </div>
          {withActions ? (
            <SkeletonBlock className="h-9 w-20 shrink-0 rounded-xl" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const StoryTraySkeleton = ({ count = 6 }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex gap-4">
        {getItems(count).map((_, index) => (
          <div key={index} className="flex shrink-0 flex-col items-center gap-2">
            <SkeletonBlock className="h-16 w-16 rounded-full" />
            <SkeletonBlock className="h-3 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const PageHeaderSkeleton = ({ actions = false }) => {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0 space-y-2">
        <SkeletonBlock className="h-7 w-48 max-w-full" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      {actions ? (
        <div className="flex gap-3">
          <SkeletonBlock className="h-11 w-32 rounded-xl" />
          <SkeletonBlock className="h-11 w-24 rounded-xl" />
        </div>
      ) : null}
    </div>
  );
};

export const StatGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {getItems(count).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
            <SkeletonBlock className="h-11 w-11 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardListSkeleton = ({ count = 4 }) => {
  return (
    <div className="space-y-4">
      {getItems(count).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-20 rounded-full" />
                <SkeletonBlock className="h-6 w-24 rounded-full" />
              </div>
              <SkeletonBlock className="h-5 w-52 max-w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-3 w-40" />
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <SkeletonBlock className="h-10 w-24 rounded-xl" />
              <SkeletonBlock className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableRowsSkeleton = ({ count = 5 }) => {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {getItems(count).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-full" />
            <div className="min-w-0 space-y-2">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-3 w-56 max-w-full" />
            </div>
          </div>

          <div className="flex gap-3">
            <SkeletonBlock className="h-8 w-20 rounded-full" />
            <SkeletonBlock className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProfilePageSkeleton = () => {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <SkeletonBlock className="h-40 rounded-none sm:h-56" />
        <div className="p-5">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <SkeletonBlock className="h-28 w-28 rounded-full border-4 border-white dark:border-slate-950" />
              <div className="mb-2 space-y-2">
                <SkeletonBlock className="h-6 w-40" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
            </div>
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SkeletonBlock className="h-12 rounded-xl" />
            <SkeletonBlock className="h-12 rounded-xl" />
            <SkeletonBlock className="h-12 rounded-xl" />
          </div>
        </div>
      </section>

      <GridSkeleton count={9} />
    </div>
  );
};

export const ReelSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <SkeletonBlock className="h-[calc(100dvh_-_8rem)] max-h-[820px] min-h-[480px] rounded-none" />
      </div>
    </div>
  );
};

export const PostDetailSkeleton = () => {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[minmax(0,1.2fr)_380px]">
      <SkeletonBlock className="min-h-[520px] rounded-none" />

      <div className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>

        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-2/3" />

        <div className="space-y-3 pt-4">
          <ListSkeleton count={4} />
        </div>
      </div>
    </div>
  );
};

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clapperboard } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { ReelSkeleton } from "../components/ui/Skeleton";
import ReelCard from "../features/reels/components/ReelCard";
import { fetchReels, resetReels } from "../features/reels/reelSlice";

const ReelsPage = () => {
  const dispatch = useDispatch();

  const { reels, page, hasMore, loading, error } = useSelector(
    (state) => state.reels,
  );

  useEffect(() => {
    dispatch(fetchReels({ page: 1, limit: 5 }));

    return () => {
      dispatch(resetReels());
    };
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchReels({ page: page + 1, limit: 5 }));
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Reels
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Watch short videos from creators.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading && reels.length === 0 ? (
        <div className="space-y-6">
          <ReelSkeleton />
        </div>
      ) : null}

      {!loading && reels.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          iconTone="blue"
          title="No reels yet"
          description="Create your first reel from Create page."
        />
      ) : null}

      <div className="snap-y snap-mandatory space-y-6">
        {reels.map((reel) => (
          <ReelCard key={reel._id} reel={reel} />
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-6 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          {loading ? "Loading..." : "Load more reels"}
        </button>
      ) : null}
    </section>
  );
};

export default ReelsPage;

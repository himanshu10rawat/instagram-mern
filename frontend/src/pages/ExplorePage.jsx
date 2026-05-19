import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Compass } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { GridSkeleton } from "../components/ui/Skeleton";
import MediaGrid from "../features/search/components/MediaGrid";
import { fetchTrendingContent } from "../features/search/searchSlice";

const ExplorePage = () => {
  const dispatch = useDispatch();

  const { trending, trendingLoading, error } = useSelector(
    (state) => state.search,
  );

  useEffect(() => {
    dispatch(fetchTrendingContent());
  }, [dispatch]);

  const allTrending = [...(trending.posts || []), ...(trending.reels || [])];

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Explore
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Trending posts and reels from creators.
        </p>
      </div>

      {trendingLoading ? (
        <GridSkeleton count={9} />
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!trendingLoading ? (
        allTrending.length === 0 ? (
          <EmptyState
            icon={Compass}
            iconTone="blue"
            title="No trending content yet"
            description="Trending posts and reels will appear here."
          />
        ) : (
          <MediaGrid items={allTrending} type="post" />
        )
      ) : null}
    </section>
  );
};

export default ExplorePage;

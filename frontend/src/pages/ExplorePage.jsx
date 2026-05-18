import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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
        <h1 className="text-2xl font-bold text-slate-950">Explore</h1>
        <p className="mt-1 text-sm text-slate-500">
          Trending posts and reels from creators.
        </p>
      </div>

      {trendingLoading ? (
        <p className="text-sm text-slate-500">Loading explore content...</p>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!trendingLoading && allTrending.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            No trending content yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Trending posts and reels will appear here.
          </p>
        </div>
      ) : (
        <MediaGrid items={allTrending} type="post" />
      )}
    </section>
  );
};

export default ExplorePage;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import MediaGrid from "../features/search/components/MediaGrid";
import { clearSavedPosts, fetchSavedPosts } from "../features/posts/postSlice";

const SavedPostsPage = () => {
  const dispatch = useDispatch();

  const { savedPosts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchSavedPosts());

    return () => {
      dispatch(clearSavedPosts());
    };
  }, [dispatch]);

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Saved Posts
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Posts you saved will appear here.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading saved posts...
        </p>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && savedPosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            No saved posts yet
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Save posts to view them later.
          </p>
        </div>
      ) : (
        <MediaGrid items={savedPosts} type="post" />
      )}
    </section>
  );
};

export default SavedPostsPage;

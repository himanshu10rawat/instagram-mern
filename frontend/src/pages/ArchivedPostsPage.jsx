import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import MediaGrid from "../features/search/components/MediaGrid";
import {
  clearArchivedPosts,
  fetchArchivedPosts,
} from "../features/posts/postSlice";

const ArchivedPostsPage = () => {
  const dispatch = useDispatch();

  const { archivedPosts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchArchivedPosts());

    return () => {
      dispatch(clearArchivedPosts());
    };
  }, [dispatch]);

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Archived Posts
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Only you can see your archived posts.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading archived posts...
        </p>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && archivedPosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            No archived posts
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Archived posts will appear here.
          </p>
        </div>
      ) : (
        <MediaGrid items={archivedPosts} type="post" />
      )}
    </section>
  );
};

export default ArchivedPostsPage;

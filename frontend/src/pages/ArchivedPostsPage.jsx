import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Archive } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { GridSkeleton } from "../components/ui/Skeleton";
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
        <GridSkeleton count={9} />
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading ? (
        archivedPosts.length === 0 ? (
          <EmptyState
            icon={Archive}
            iconTone="blue"
            title="No archived posts"
            description="Archived posts will appear here."
          />
        ) : (
          <MediaGrid items={archivedPosts} type="post" />
        )
      ) : null}
    </section>
  );
};

export default ArchivedPostsPage;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bookmark } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { GridSkeleton } from "../components/ui/Skeleton";
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
        <GridSkeleton count={9} />
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading ? (
        savedPosts.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            iconTone="blue"
            title="No saved posts yet"
            description="Save posts to view them later."
          />
        ) : (
          <MediaGrid items={savedPosts} type="post" />
        )
      ) : null}
    </section>
  );
};

export default SavedPostsPage;

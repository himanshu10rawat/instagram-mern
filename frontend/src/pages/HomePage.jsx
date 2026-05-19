import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ImagePlus } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { FeedSkeleton } from "../components/ui/Skeleton";
import PostCard from "../features/posts/components/PostCard";
import { fetchFeedPosts } from "../features/posts/postSlice";
import SuggestedUsers from "../features/profile/components/SuggestedUsers";
import { fetchStoriesFeed } from "../features/stories/storySlice";
import StoryTray from "../features/stories/components/StoryTray";

const HomePage = () => {
  const dispatch = useDispatch();

  const { posts, loading, error, page, hasMore } = useSelector(
    (state) => state.posts,
  );

  const currentUser = useSelector((state) => state.auth.user);
  const { loading: storyLoading, storyGroups } = useSelector(
    (state) => state.stories,
  );

  useEffect(() => {
    dispatch(fetchStoriesFeed());
    dispatch(fetchFeedPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchFeedPosts({ page: page + 1, limit: 10 }));
    }
  };

  const currentUserFromFeed = posts.find(
    (post) => post.author?._id === currentUser?._id,
  )?.author;
  const storyCurrentUser = currentUser
    ? {
        ...currentUserFromFeed,
        ...currentUser,
        avatar: currentUser?.avatar?.url
          ? currentUser.avatar
          : currentUserFromFeed?.avatar,
      }
    : currentUserFromFeed;

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <section className="mx-auto max-w-2xl space-y-6">
          <StoryTray
            storyGroups={storyGroups}
            currentUser={storyCurrentUser}
            loading={storyLoading}
          />
        </section>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {loading && posts.length === 0 ? (
            <FeedSkeleton count={2} />
          ) : null}

          {!loading && posts.length === 0 ? (
            <EmptyState
              icon={ImagePlus}
              title="No posts yet"
              description="Follow users or create your first post."
              action={
                <Link
                  to="/create"
                  className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                >
                  Create post
                </Link>
              }
            />
          ) : null}

          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          ) : null}
        </div>
      </div>

      <SuggestedUsers />
    </section>
  );
};

export default HomePage;

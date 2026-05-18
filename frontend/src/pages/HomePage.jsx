import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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
  const { storyGroups } = useSelector((state) => state.stories);

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
          <StoryTray storyGroups={storyGroups} currentUser={storyCurrentUser} />
        </section>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {loading && posts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading feed...
            </p>
          ) : null}

          {!loading && posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                No posts yet
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Follow users or create your first post.
              </p>
            </div>
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

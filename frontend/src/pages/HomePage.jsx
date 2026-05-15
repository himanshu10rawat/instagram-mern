import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PostCard from "../features/posts/components/PostCard";
import { fetchFeedPosts } from "../features/posts/postSlice";
import SuggestedUsers from "../features/profile/components/SuggestedUsers";
import { fetchSuggestedUsers } from "../features/profile/recommendationSlice";
import StoryBar from "../features/stories/components/StoryBar";
import { fetchStoriesFeed } from "../features/stories/storySlice";

const HomePage = () => {
  const dispatch = useDispatch();

  const { posts, loading, error, page, hasMore } = useSelector(
    (state) => state.posts,
  );
  const { users: suggestedUsers } = useSelector(
    (state) => state.recommendations,
  );

  useEffect(() => {
    dispatch(fetchStoriesFeed());
    dispatch(fetchFeedPosts({ page: 1, limit: 10 }));
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchFeedPosts({ page: page + 1, limit: 10 }));
    }
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <StoryBar />

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {loading && posts.length === 0 ? (
            <p className="text-sm text-slate-500">Loading feed...</p>
          ) : null}

          {!loading && posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <h2 className="text-lg font-semibold">No posts yet</h2>
              <p className="mt-2 text-sm text-slate-500">
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          ) : null}
        </div>
      </div>

      <SuggestedUsers users={suggestedUsers} />
    </section>
  );
};

export default HomePage;

import { Hash, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Avatar from "../components/common/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { GridSkeleton, ListSkeleton } from "../components/ui/Skeleton";
import HashtagSearchResult from "../features/search/components/HashtagSearchResult";
import MediaGrid from "../features/search/components/MediaGrid";
import UserSearchResult from "../features/search/components/UserSearchResult";
import {
  addRecentSearch,
  clearSearchHistory,
  clearRecentSearches,
  clearSearchResults,
  fetchSearchHistory,
  searchAll,
  saveSearchHistory,
  setSearchQuery,
} from "../features/search/searchSlice";

const tabs = ["users", "posts", "reels", "hashtags"];

const SearchPage = () => {
  const dispatch = useDispatch();

  const {
    query,
    users,
    posts,
    reels,
    hashtags,
    recentSearches,
    loading,
    error,
  } = useSelector((state) => state.search);

  const [activeTab, setActiveTab] = useState("users");
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    dispatch(fetchSearchHistory());
  }, [dispatch]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      const trimmedQuery = localQuery.trim();

      dispatch(setSearchQuery(trimmedQuery));

      if (trimmedQuery.length >= 2) {
        dispatch(searchAll(trimmedQuery));
      }

      if (trimmedQuery.length === 0) {
        dispatch(clearSearchResults());
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [dispatch, localQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = localQuery.trim();

    if (trimmedQuery.length >= 2) {
      dispatch(addRecentSearch(trimmedQuery));
      dispatch(saveSearchHistory(trimmedQuery));
      dispatch(searchAll(trimmedQuery));
    }
  };

  const handleRecentClick = (item) => {
    const searchValue = typeof item === "string" ? item : item.value;

    if (!searchValue) return;

    setLocalQuery(searchValue);
    dispatch(addRecentSearch(item));
    dispatch(saveSearchHistory(searchValue));
    dispatch(searchAll(searchValue));
  };

  const handleUserSelect = (user) => {
    if (!user?._id) return;

    const historyItem = {
      type: "user",
      value: user.username,
      label: user.username,
      subtitle: user.fullName || "pixelFeed user",
      user,
    };

    dispatch(addRecentSearch(historyItem));
    dispatch(
      saveSearchHistory({
        searchType: "user",
        searchedUserId: user._id,
      }),
    );
  };

  const handleRecentUserClick = (item) => {
    dispatch(addRecentSearch(item));

    if (item.user?._id) {
      dispatch(
        saveSearchHistory({
          searchType: "user",
          searchedUserId: item.user._id,
        }),
      );
    }
  };

  const hasQuery = localQuery.trim().length >= 2;

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Search
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search users, posts, reels and hashtags.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 focus-within:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-white">
            <Search size={20} className="text-slate-500 dark:text-slate-400" />

            <input
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Search pixelFeed"
              className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 sm:text-sm"
            />

            {localQuery ? (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  dispatch(clearSearchResults());
                }}
                className="text-slate-500 dark:text-slate-400"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        </form>

        {!hasQuery ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                Recent searches
              </h2>

              {recentSearches.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearRecentSearches());
                    dispatch(clearSearchHistory());
                  }}
                  className="text-sm font-semibold text-blue-500"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {recentSearches.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No recent searches"
                  description="Your recent searches will appear here."
                  variant="inline"
                  size="sm"
                />
              ) : (
                recentSearches.map((item) => {
                  if (item.type === "user" && item.user?.username) {
                    return (
                      <Link
                        key={item.key || item.user._id}
                        to={`/profile/${item.user.username}`}
                        onClick={() => handleRecentUserClick(item)}
                        className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-left transition hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
                      >
                        <Avatar
                          src={item.user.avatar?.url}
                          alt={item.user.username}
                        />

                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-950 dark:text-white">
                            {item.label || item.user.username}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.subtitle || "pixelFeed user"}
                          </span>
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.key || item.value}
                      type="button"
                      onClick={() => handleRecentClick(item)}
                      className="flex min-h-12 min-w-0 items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Search size={16} className="shrink-0" />
                      <span className="truncate">{item.label || item.value}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        {hasQuery ? (
          <>
            <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`min-h-11 shrink-0 px-4 py-3 text-sm font-semibold capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-slate-950 text-slate-950 dark:border-white dark:text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="mt-6">
                {activeTab === "posts" || activeTab === "reels" ? (
                  <GridSkeleton count={6} />
                ) : (
                  <ListSkeleton count={4} />
                )}
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div className="mt-6">
              {activeTab === "users" && !loading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {users.length === 0 && !loading ? (
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      description="Try a username, full name, or a different keyword."
                      variant="subtle"
                    />
                  ) : (
                    users.map((user) => (
                      <UserSearchResult
                        key={user._id}
                        user={user}
                        onSelect={handleUserSelect}
                      />
                    ))
                  )}
                </div>
              ) : null}

              {activeTab === "posts" && !loading ? (
                <MediaGrid items={posts} type="post" />
              ) : null}

              {activeTab === "reels" && !loading ? (
                <MediaGrid items={reels} type="reel" />
              ) : null}

              {activeTab === "hashtags" && !loading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {hashtags.length === 0 && !loading ? (
                    <EmptyState
                      icon={Hash}
                      title="No hashtags found"
                      description="Try a shorter tag or a different keyword."
                      variant="subtle"
                    />
                  ) : (
                    hashtags.map((hashtag) => (
                      <HashtagSearchResult
                        key={hashtag._id || hashtag.name}
                        hashtag={hashtag}
                      />
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default SearchPage;

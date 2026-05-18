import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import HashtagSearchResult from "../features/search/components/HashtagSearchResult";
import MediaGrid from "../features/search/components/MediaGrid";
import UserSearchResult from "../features/search/components/UserSearchResult";
import {
  addRecentSearch,
  clearRecentSearches,
  clearSearchResults,
  searchAll,
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
      dispatch(searchAll(trimmedQuery));
    }
  };

  const handleRecentClick = (value) => {
    setLocalQuery(value);
    dispatch(addRecentSearch(value));
    dispatch(searchAll(value));
  };

  const hasQuery = localQuery.trim().length >= 2;

  return (
    <section className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-950">Search</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search users, posts, reels and hashtags.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-slate-950">
            <Search size={20} className="text-slate-500" />

            <input
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Search Instagram"
              className="flex-1 bg-transparent text-sm outline-none"
            />

            {localQuery ? (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  dispatch(clearSearchResults());
                }}
                className="text-slate-500"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        </form>

        {!hasQuery ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-950">
                Recent searches
              </h2>

              {recentSearches.length > 0 ? (
                <button
                  type="button"
                  onClick={() => dispatch(clearRecentSearches())}
                  className="text-sm font-semibold text-blue-500"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {recentSearches.length === 0 ? (
                <p className="text-sm text-slate-500">No recent searches.</p>
              ) : (
                recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRecentClick(item)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                  >
                    {item}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}

        {hasQuery ? (
          <>
            <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-slate-950 text-slate-950"
                      : "text-slate-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Searching...</p>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div className="mt-6">
              {activeTab === "users" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {users.length === 0 && !loading ? (
                    <p className="text-sm text-slate-500">No users found.</p>
                  ) : (
                    users.map((user) => (
                      <UserSearchResult key={user._id} user={user} />
                    ))
                  )}
                </div>
              ) : null}

              {activeTab === "posts" ? (
                <MediaGrid items={posts} type="post" />
              ) : null}

              {activeTab === "reels" ? (
                <MediaGrid items={reels} type="reel" />
              ) : null}

              {activeTab === "hashtags" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {hashtags.length === 0 && !loading ? (
                    <p className="text-sm text-slate-500">No hashtags found.</p>
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

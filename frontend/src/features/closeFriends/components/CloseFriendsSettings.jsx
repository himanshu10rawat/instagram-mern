import { Check, Search, Star, UserMinus, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import EmptyState from "../../../components/ui/EmptyState";
import { ListSkeleton } from "../../../components/ui/Skeleton";
import { searchUsersApi } from "../../search/searchService";
import {
  addCloseFriend,
  clearCloseFriendStatus,
  fetchCloseFriends,
  removeCloseFriend,
} from "../closeFriendSlice";

const getId = (value) => value?._id?.toString?.() || value?._id || value;

const CloseFriendsSettings = ({ profile }) => {
  const dispatch = useDispatch();
  const { friends, loading, actionLoadingById, error, successMessage } =
    useSelector((state) => state.closeFriends);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const currentUserId = getId(profile);
  const closeFriendIds = useMemo(
    () => new Set(friends.map((friend) => getId(friend)).filter(Boolean)),
    [friends],
  );
  const followingIds = useMemo(
    () =>
      new Set((profile?.following || []).map((user) => getId(user)).filter(Boolean)),
    [profile?.following],
  );

  const filteredResults = useMemo(
    () => results.filter((user) => getId(user) !== currentUserId),
    [currentUserId, results],
  );

  useEffect(() => {
    dispatch(fetchCloseFriends());
  }, [dispatch]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return undefined;
    }

    let isActive = true;
    const timerId = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const users = await searchUsersApi(trimmedQuery);

        if (isActive) {
          setResults(users || []);
        }
      } catch (searchRequestError) {
        if (isActive) {
          setSearchError(
            searchRequestError.response?.data?.message || "Search failed",
          );
          setResults([]);
        }
      } finally {
        if (isActive) {
          setSearchLoading(false);
        }
      }
    }, 450);

    return () => {
      isActive = false;
      clearTimeout(timerId);
    };
  }, [query]);

  const handleAdd = (user) => {
    dispatch(clearCloseFriendStatus());
    dispatch(addCloseFriend({ userId: user._id, user }));
  };

  const handleRemove = (userId) => {
    dispatch(clearCloseFriendStatus());
    dispatch(removeCloseFriend(userId));
  };

  const renderUserAction = (user) => {
    const userId = getId(user);
    const isCloseFriend = closeFriendIds.has(userId);
    const isFollowing = followingIds.has(userId);
    const isBusy = Boolean(actionLoadingById[userId]);

    if (isCloseFriend) {
      return (
        <span className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check size={15} />
          Added
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleAdd(user)}
        disabled={!isFollowing || isBusy}
        className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
      >
        {isBusy ? "Adding..." : isFollowing ? "Add" : "Follow first"}
      </button>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <UsersRound size={22} />
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Close Friends
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Stories shared with close friends are visible only to people in this
            list.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {friends.length}/10
        </span>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2 focus-within:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-white">
          <Search size={18} className="shrink-0 text-slate-500" />

          <input
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;

              setQuery(nextQuery);
              setSearchError("");

              if (nextQuery.trim().length < 2) {
                setResults([]);
                setSearchLoading(false);
              }

              dispatch(clearCloseFriendStatus());
            }}
            placeholder="Search followed users"
            className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 sm:text-sm"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSearchLoading(false);
                setSearchError("");
              }}
              className="text-slate-500 dark:text-slate-400"
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          ) : null}
        </div>

        {query.trim().length >= 2 ? (
          <div className="mt-3 space-y-2">
            {searchLoading ? <ListSkeleton count={2} /> : null}

            {searchError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {searchError}
              </p>
            ) : null}

            {!searchLoading && !searchError && filteredResults.length === 0 ? (
              <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                No users found.
              </p>
            ) : null}

            {!searchLoading && !searchError
              ? filteredResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex min-w-0 items-center gap-3 rounded-xl bg-white p-3 dark:bg-slate-950"
                  >
                    <Avatar src={user.avatar?.url} alt={user.username} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {user.username}
                      </p>

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user.fullName || "Instagram user"}
                      </p>
                    </div>

                    {renderUserAction(user)}
                  </div>
                ))
              : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
          People in your list
        </h3>

        <div className="mt-3 space-y-2">
          {loading ? <ListSkeleton count={3} /> : null}

          {!loading && friends.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No close friends yet"
              description="Search and add people you already follow."
              variant="subtle"
              size="sm"
            />
          ) : null}

          {!loading
            ? friends.map((friend) => {
                const friendId = getId(friend);
                const isBusy = Boolean(actionLoadingById[friendId]);

                return (
                  <div
                    key={friendId}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <Avatar src={friend.avatar?.url} alt={friend.username} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {friend.username}
                      </p>

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {friend.fullName || "Instagram user"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(friendId)}
                      disabled={isBusy}
                      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-300"
                    >
                      <UserMinus size={15} />
                      {isBusy ? "Removing..." : "Remove"}
                    </button>
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
};

export default CloseFriendsSettings;

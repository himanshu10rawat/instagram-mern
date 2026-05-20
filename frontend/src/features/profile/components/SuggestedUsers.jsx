import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";

import Avatar from "../../../components/common/Avatar";
import EmptyState from "../../../components/ui/EmptyState";
import { ListSkeleton } from "../../../components/ui/Skeleton";
import {
  cancelFollowRequest,
  followUser,
  unfollowUser,
} from "../../follow/followSlice";
import { fetchSuggestedUsers } from "../recommendationSlice";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const getFollowStatus = ({ user, currentUserId }) => {
  const followers = user?.followers || [];
  const followRequests = user?.followRequests || [];

  const isFollowing = followers.some(
    (follower) => getId(follower) === currentUserId,
  );

  const hasRequested =
    Boolean(user?.hasPendingFollowRequest) ||
    followRequests.some((requestUser) => getId(requestUser) === currentUserId);

  return {
    isFollowing,
    hasRequested,
  };
};

const SuggestedUsers = ({ limit = 5, showHeader = true }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const { users, loading, error } = useSelector(
    (state) => state.recommendations,
  );

  const currentUserId = currentUser?._id;
  const visibleUsers = limit ? users.slice(0, limit) : users;

  const [processingIds, setProcessingIds] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleFollowToggle = async ({ user, isFollowing, isRequested }) => {
    if (!user?._id) return;

    // optimistic UI per-item
    setProcessingIds((prev) => [...prev, user._id]);

    try {
      let result;

      if (isFollowing) {
        result = await dispatch(unfollowUser(user._id));
      } else if (isRequested) {
        result = await dispatch(cancelFollowRequest(user._id));
      } else {
        // optimistic: update UI immediately by re-fetching suggestions after success
        result = await dispatch(followUser(user._id));
      }

      if (
        followUser.fulfilled.match(result) ||
        unfollowUser.fulfilled.match(result) ||
        cancelFollowRequest.fulfilled.match(result)
      ) {
        if (followUser.fulfilled.match(result) && user.isPrivate) {
          setRequestedIds((prev) =>
            prev.includes(user._id) ? prev : [...prev, user._id],
          );
        }

        if (cancelFollowRequest.fulfilled.match(result)) {
          setRequestedIds((prev) => prev.filter((id) => id !== user._id));
        }

        dispatch(fetchSuggestedUsers({ force: true }));
      } else if (
        followUser.rejected.match(result) &&
        result.payload === "Follow request already sent"
      ) {
        setRequestedIds((prev) =>
          prev.includes(user._id) ? prev : [...prev, user._id],
        );
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== user._id));
    }
  };

  const getButtonText = ({ user, isFollowing, hasRequested }) => {
    if (isFollowing) return "Following";
    if (hasRequested) return "Cancel";

    return user?.isPrivate ? "Request" : "Follow";
  };

  return (
    <aside className="mobile-edge rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-4">
      {showHeader ? (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">
            Suggested for you
          </h2>

          <Link
            to="/suggestions"
            className="text-xs font-semibold text-slate-500 hover:text-slate-950 dark:hover:text-white"
          >
            See all
          </Link>
        </div>
      ) : null}

      {loading ? <ListSkeleton count={limit || 5} withActions /> : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {!loading && visibleUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No suggestions available"
          description="New account suggestions will appear here."
          variant="inline"
          size="sm"
        />
      ) : null}

      <div className="space-y-3">
        {!loading
          ? visibleUsers.map((user) => {
              const { isFollowing, hasRequested } = getFollowStatus({
                user,
                currentUserId,
              });
              const isRequested =
                hasRequested || requestedIds.includes(user._id);

              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Avatar
                      src={user.avatar?.url}
                      alt={user.username}
                      size="md"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {user.username}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.fullName || "Suggested for you"}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleFollowToggle({ user, isFollowing, isRequested })
                    }
                    disabled={processingIds.includes(user._id)}
                    className={`min-h-10 shrink-0 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70 flex items-center gap-2 ${
                      isFollowing || isRequested
                        ? "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                        : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    }`}
                  >
                    {processingIds.includes(user._id) ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : null}

                    {getButtonText({
                      user,
                      isFollowing,
                      hasRequested: isRequested,
                    })}
                  </button>
                </div>
              );
            })
          : null}
      </div>
    </aside>
  );
};

export default SuggestedUsers;

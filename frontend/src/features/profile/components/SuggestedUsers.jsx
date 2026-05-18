import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { followUser, unfollowUser } from "../../follow/followSlice";
import { fetchSuggestedUsers } from "../recommendationSlice";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const getFollowStatus = ({ user, currentUserId }) => {
  const followers = user?.followers || [];
  const followRequests = user?.followRequests || [];

  const isFollowing = followers.some(
    (follower) => getId(follower) === currentUserId,
  );

  const hasRequested = followRequests.some(
    (requestUser) => getId(requestUser) === currentUserId,
  );

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

  useEffect(() => {
    dispatch(fetchSuggestedUsers());
  }, [dispatch]);

  const handleFollowToggle = async ({ user, isFollowing }) => {
    if (!user?._id) return;

    let result;

    if (isFollowing) {
      result = await dispatch(unfollowUser(user._id));
    } else {
      result = await dispatch(followUser(user._id));
    }

    if (
      followUser.fulfilled.match(result) ||
      unfollowUser.fulfilled.match(result)
    ) {
      dispatch(fetchSuggestedUsers());
    }
  };

  const getButtonText = ({ user, isFollowing, hasRequested }) => {
    if (isFollowing) return "Following";
    if (hasRequested) return "Requested";

    return user?.isPrivate ? "Request" : "Follow";
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
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

      {loading ? (
        <p className="text-sm text-slate-500">Loading suggestions...</p>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {!loading && visibleUsers.length === 0 ? (
        <p className="text-sm text-slate-500">No suggestions available.</p>
      ) : null}

      <div className="space-y-3">
        {visibleUsers.map((user) => {
          const { isFollowing, hasRequested } = getFollowStatus({
            user,
            currentUserId,
          });

          return (
            <div
              key={user._id}
              className="flex items-center justify-between gap-3"
            >
              <Link
                to={`/profile/${user.username}`}
                className="flex min-w-0 items-center gap-3"
              >
                <Avatar src={user.avatar?.url} alt={user.username} size="md" />

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
                onClick={() => handleFollowToggle({ user, isFollowing })}
                disabled={hasRequested}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${
                  isFollowing || hasRequested
                    ? "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                }`}
              >
                {getButtonText({ user, isFollowing, hasRequested })}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SuggestedUsers;

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { followUser } from "../../follow/followSlice";
import { fetchSuggestedUsers } from "../recommendationSlice";

const SuggestedUsers = ({ users = [] }) => {
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.follow);

  const handleFollow = async (userId) => {
    const result = await dispatch(followUser(userId));

    if (followUser.fulfilled.match(result)) {
      dispatch(fetchSuggestedUsers());
    }
  };

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Suggested for you
        </h2>

        <div className="mt-4 space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No suggestions yet.
            </p>
          ) : (
            users.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <Link
                  to={`/profile/${user.username}`}
                  className="flex min-w-0 items-center gap-3"
                >
                  <Avatar
                    src={user.avatar?.url}
                    alt={user.username}
                    size="md"
                  />

                  <div>
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.fullName || "Suggested user"}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleFollow(user._id)}
                  disabled={actionLoading}
                  className="text-sm font-semibold text-blue-500"
                >
                  {actionLoading ? "..." : user.isPrivate ? "Request" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default SuggestedUsers;

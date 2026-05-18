import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";
import {
  getFollowersApi,
  getFollowingApi,
} from "../../follow/followService";

const titles = {
  followers: "Followers",
  following: "Following",
};

const FollowListModal = ({ profileId, type, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          type === "followers"
            ? await getFollowersApi(profileId)
            : await getFollowingApi(profileId);

        if (isMounted) {
          setUsers(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load users");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (profileId && type) {
      fetchUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [profileId, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            {titles[type]}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          {loading ? (
            <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
              Loading {titles[type].toLowerCase()}...
            </p>
          ) : null}

          {error ? (
            <div className="m-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {!loading && !error && users.length === 0 ? (
            <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
              No {titles[type].toLowerCase()} yet.
            </p>
          ) : null}

          {users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user.username}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <Avatar src={user.avatar?.url} alt={user.username} />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                  {user.username}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.fullName || "Instagram user"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;

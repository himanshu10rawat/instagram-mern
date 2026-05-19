import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

import Avatar from "../../../components/common/Avatar";
import EmptyState from "../../../components/ui/EmptyState";
import ModalShell from "../../../components/ui/ModalShell";
import { ListSkeleton } from "../../../components/ui/Skeleton";
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
    <ModalShell title={titles[type]} onClose={onClose} className="max-w-md">
      <div className="max-h-96 overflow-y-auto p-3">
        {loading ? (
          <ListSkeleton count={5} />
        ) : null}

        {error ? (
          <div className="m-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && !error && users.length === 0 ? (
          <EmptyState
            icon={Users}
            title={`No ${titles[type].toLowerCase()} yet`}
            description="This list will update as the profile grows."
            variant="inline"
            size="sm"
          />
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
    </ModalShell>
  );
};

export default FollowListModal;

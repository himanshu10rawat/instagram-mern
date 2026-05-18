import { Link } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";

const UserSearchResult = ({ user }) => {
  return (
    <Link
      to={`/profile/${user.username}`}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
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
  );
};

export default UserSearchResult;

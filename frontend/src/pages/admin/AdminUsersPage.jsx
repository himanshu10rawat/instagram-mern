import { Ban, Search, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import { TableRowsSkeleton } from "../../components/ui/Skeleton";
import {
  blockAdminUser,
  fetchAdminUsers,
  resetAdmin,
  unblockAdminUser,
} from "../../features/admin/adminSlice";

const AdminUsersPage = () => {
  const dispatch = useDispatch();

  const { users, loading, actionLoading, error, successMessage } = useSelector(
    (state) => state.admin,
  );

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    dispatch(fetchAdminUsers({ search: "" }));

    return () => {
      dispatch(resetAdmin());
    };
  }, [dispatch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    dispatch(fetchAdminUsers({ search: searchValue.trim() }));
  };

  const handleBlockToggle = (user) => {
    if (user.isBlockedByAdmin) {
      dispatch(unblockAdminUser(user._id));
      return;
    }

    dispatch(blockAdminUser(user._id));
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Users Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Search users and block or unblock suspicious accounts.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="grid gap-2 sm:flex sm:gap-3">
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search username, email, full name..."
          className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:text-sm"
        />

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          <Search size={18} />
          Search
        </button>
      </form>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {successMessage}
        </div>
      ) : null}

      <div className="mobile-edge overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl">
        {loading ? (
          <TableRowsSkeleton count={5} />
        ) : null}

        {!loading && users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try another username, email, or full name."
            variant="inline"
            className="m-5"
          />
        ) : null}

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {users.map((user) => (
            <article
              key={user._id}
              className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar src={user.avatar?.url} alt={user.username} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {user.username}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.fullName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-3 sm:flex">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isBlockedByAdmin
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {user.isBlockedByAdmin ? "Blocked" : "Active"}
                </span>

                <button
                  type="button"
                  onClick={() => handleBlockToggle(user)}
                  disabled={actionLoading}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
                    user.isBlockedByAdmin
                      ? "border border-emerald-200 text-emerald-600"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {user.isBlockedByAdmin ? (
                    <ShieldCheck size={16} />
                  ) : (
                    <Ban size={16} />
                  )}
                  {user.isBlockedByAdmin ? "Unblock" : "Block"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminUsersPage;

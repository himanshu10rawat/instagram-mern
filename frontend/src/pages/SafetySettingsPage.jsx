import { Ban, BellOff } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/Skeleton";
import {
  fetchBlockedUsers,
  fetchMutedUsers,
  resetSafety,
  unblockUser,
  unmuteUser,
} from "../features/safety/safetySlice";

const SafetyUserRow = ({ user, actionLabel, onAction, actionLoading }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={user.avatar?.url} alt={user.username} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            {user.username}
          </p>

          <p className="truncate text-xs text-slate-500">
            {user.fullName || user.bio || "pixelFeed user"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={actionLoading}
        className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
      >
        {actionLabel}
      </button>
    </div>
  );
};

const SafetySettingsPage = () => {
  const dispatch = useDispatch();

  const {
    blockedUsers,
    mutedUsers,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.safety);

  useEffect(() => {
    dispatch(fetchBlockedUsers());
    dispatch(fetchMutedUsers());

    return () => {
      dispatch(resetSafety());
    };
  }, [dispatch]);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Safety
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage blocked and muted accounts.
        </p>
      </div>

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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-3">
          <Ban size={20} />
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Blocked users
          </h2>
        </div>

        {loading ? (
          <ListSkeleton count={3} withActions />
        ) : null}

        {!loading && blockedUsers.length === 0 ? (
          <EmptyState
            icon={Ban}
            title="No blocked users"
            description="Accounts you block will appear here."
            variant="subtle"
            size="sm"
          />
        ) : null}

        <div className="mt-4 space-y-3">
          {blockedUsers.map((user) => (
            <SafetyUserRow
              key={user._id}
              user={user}
              actionLabel="Unblock"
              actionLoading={actionLoading}
              onAction={() => dispatch(unblockUser(user._id))}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-3">
          <BellOff size={20} />
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Muted users
          </h2>
        </div>

        {loading ? (
          <ListSkeleton count={3} withActions />
        ) : null}

        {!loading && mutedUsers.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="No muted users"
            description="Muted accounts will appear here."
            variant="subtle"
            size="sm"
          />
        ) : null}

        <div className="mt-4 space-y-3">
          {mutedUsers.map((user) => (
            <SafetyUserRow
              key={user._id}
              user={user}
              actionLabel="Unmute"
              actionLoading={actionLoading}
              onAction={() => dispatch(unmuteUser(user._id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SafetySettingsPage;

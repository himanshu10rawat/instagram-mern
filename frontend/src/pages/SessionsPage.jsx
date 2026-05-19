import {
  Laptop,
  LogOut,
  MonitorSmartphone,
  RefreshCcw,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import EmptyState from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/Skeleton";
import { logoutLocally } from "../features/auth/authSlice";
import {
  clearSessionStatus,
  fetchSessions,
  resetSessions,
  revokeAllSessions,
  revokeSession,
} from "../features/sessions/sessionSlice";

const formatDate = (value) => {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getDeviceIcon = (session) => {
  const text =
    `${session.deviceName || ""} ${session.userAgent || ""}`.toLowerCase();

  if (
    text.includes("mobile") ||
    text.includes("android") ||
    text.includes("iphone")
  ) {
    return Smartphone;
  }

  if (
    text.includes("windows") ||
    text.includes("mac") ||
    text.includes("linux")
  ) {
    return Laptop;
  }

  return MonitorSmartphone;
};

const isLikelyCurrentDevice = (session) => {
  if (!session?.userAgent || typeof navigator === "undefined") {
    return false;
  }

  return session.userAgent === navigator.userAgent;
};

const SessionsPage = () => {
  const dispatch = useDispatch();

  const { sessions, loading, actionLoading, error, successMessage } =
    useSelector((state) => state.sessions);

  useEffect(() => {
    dispatch(fetchSessions());

    return () => {
      dispatch(resetSessions());
    };
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(clearSessionStatus());
    dispatch(fetchSessions());
  };

  const handleRevokeSession = async (sessionId) => {
    if (!sessionId) return;

    await dispatch(revokeSession(sessionId));
  };

  const handleRevokeAll = async () => {
    const confirmed = window.confirm(
      "This will log out all active sessions. You may need to login again. Continue?",
    );

    if (!confirmed) return;

    const result = await dispatch(revokeAllSessions());

    if (revokeAllSessions.fulfilled.match(result)) {
      dispatch(logoutLocally());
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Login Activity
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage devices and sessions where your account is logged in.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
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

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 text-amber-700" size={20} />

          <div>
            <h2 className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Security tip
            </h2>

            <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
              If you see a device you do not recognize, revoke that session and
              change your password from Settings.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Active sessions
          </h2>

          <button
            type="button"
            onClick={handleRevokeAll}
            disabled={actionLoading || sessions.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <LogOut size={16} />
            Logout all
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <ListSkeleton count={4} withActions />
          </div>
        ) : null}

        {!loading && sessions.length === 0 ? (
          <EmptyState
            icon={MonitorSmartphone}
            title="No active sessions found"
            description="Your active login sessions will appear here."
            className="m-4"
            variant="inline"
          />
        ) : null}

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {!loading
            ? sessions.map((session) => {
                const Icon = getDeviceIcon(session);
                const isCurrentDevice = isLikelyCurrentDevice(session);

                return (
                  <article
                    key={session._id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        <Icon size={22} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950 dark:text-white">
                            {session.deviceName || "Unknown Device"}
                          </h3>

                          {isCurrentDevice ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              This device
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          IP Address: {session.ipAddress || "Unknown"}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {session.userAgent || "No user agent available"}
                        </p>

                        <div className="mt-3 grid gap-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                          <p>Created: {formatDate(session.createdAt)}</p>
                          <p>Last used: {formatDate(session.lastUsedAt)}</p>
                          <p>Expires: {formatDate(session.expiresAt)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session._id)}
                      disabled={actionLoading}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60 dark:border-red-900/70"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </article>
                );
              })
            : null}
        </div>
      </div>
    </section>
  );
};

export default SessionsPage;

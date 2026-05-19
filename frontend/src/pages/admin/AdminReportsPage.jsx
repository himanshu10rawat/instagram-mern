import { CheckCircle2, Flag, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import EmptyState from "../../components/ui/EmptyState";
import { CardListSkeleton } from "../../components/ui/Skeleton";
import {
  deleteAdminComment,
  deleteAdminPost,
  deleteAdminReel,
  deleteAdminReport,
  fetchAdminReports,
  resetAdmin,
  resolveAdminReport,
} from "../../features/admin/adminSlice";

const getTargetTitle = (report) => {
  if (report.reportedUser?.username) return `@${report.reportedUser.username}`;
  if (report.post?._id) return `Post: ${report.post._id}`;
  if (report.reel?._id) return `Reel: ${report.reel._id}`;
  if (report.comment?._id) return `Comment: ${report.comment._id}`;

  return "Unknown target";
};

const AdminReportsPage = () => {
  const dispatch = useDispatch();

  const { reports, loading, actionLoading, error, successMessage } =
    useSelector((state) => state.admin);

  const [status, setStatus] = useState("pending");

  useEffect(() => {
    dispatch(fetchAdminReports({ status }));

    return () => {
      dispatch(resetAdmin());
    };
  }, [dispatch, status]);

  const handleRefresh = () => {
    dispatch(fetchAdminReports({ status }));
  };

  const handleDeleteTarget = async (report) => {
    const confirmed = window.confirm("Remove reported content?");

    if (!confirmed) return;

    if (report.post?._id) {
      await dispatch(deleteAdminPost(report.post._id));
    }

    if (report.reel?._id) {
      await dispatch(deleteAdminReel(report.reel._id));
    }

    if (report.comment?._id) {
      await dispatch(deleteAdminComment(report.comment._id));
    }

    await dispatch(resolveAdminReport(report._id));
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Reports Review
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review user, post, reel, and comment reports.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-slate-700"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
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

      <div className="space-y-4">
        {loading ? (
          <CardListSkeleton count={4} />
        ) : null}

        {!loading && reports.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No reports found"
            description="Reports matching this filter will appear here."
          />
        ) : null}

        {reports.map((report) => (
          <article
            key={report._id}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-5"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    {report.reason}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {report.status || "pending"}
                  </span>
                </div>

                <h2 className="mt-3 text-base font-bold text-slate-950 dark:text-white">
                  {getTargetTitle(report)}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {report.description || "No description provided."}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Reported by: @{report.reporter?.username || "unknown"}
                </p>
              </div>

              <div className="grid shrink-0 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <button
                  type="button"
                  onClick={() => dispatch(resolveAdminReport(report._id))}
                  disabled={actionLoading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 disabled:opacity-60"
                >
                  <CheckCircle2 size={16} />
                  Resolve
                </button>

                {report.post?._id || report.reel?._id || report.comment?._id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTarget(report)}
                    disabled={actionLoading}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Remove Content
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => dispatch(deleteAdminReport(report._id))}
                  disabled={actionLoading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  Delete Report
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminReportsPage;

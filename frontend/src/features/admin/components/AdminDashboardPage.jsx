import { Flag, Image, Radio, RefreshCcw, Users, Video } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminStatCard from "../../features/admin/components/AdminStatCard";
import {
  fetchAdminDashboard,
  resetAdmin,
} from "../../features/admin/adminSlice";

const AdminDashboardPage = () => {
  const dispatch = useDispatch();

  const { dashboard, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());

    return () => {
      dispatch(resetAdmin());
    };
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminDashboard());
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor users, reports, and platform content.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-slate-700"
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

      {loading && !dashboard ? (
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          icon={Users}
          label="Total Users"
          value={dashboard?.totalUsers}
        />
        <AdminStatCard
          icon={Image}
          label="Total Posts"
          value={dashboard?.totalPosts}
        />
        <AdminStatCard
          icon={Video}
          label="Total Reels"
          value={dashboard?.totalReels}
        />
        <AdminStatCard
          icon={Radio}
          label="Live Sessions"
          value={dashboard?.totalLives}
        />
        <AdminStatCard
          icon={Flag}
          label="Pending Reports"
          value={dashboard?.pendingReports}
        />
        <AdminStatCard
          icon={Users}
          label="Blocked Users"
          value={dashboard?.blockedUsers}
        />
      </div>
    </section>
  );
};

export default AdminDashboardPage;

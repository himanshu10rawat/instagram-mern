import { ArrowRight, Flag, Image, Radio, RefreshCcw, Users, Video } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { StatGridSkeleton } from "../../../components/ui/Skeleton";
import { fetchAdminDashboard, resetAdmin } from "../adminSlice";
import AdminStatCard from "./AdminStatCard";

const activityLinks = [
  {
    label: "Users",
    description: "Accounts, roles, blocks, and activity counts",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Posts",
    description: "Captions, tags, authors, likes, comments",
    path: "/admin/posts",
    icon: Image,
  },
  {
    label: "Reels",
    description: "Creators, audio, views, shares, hashtags",
    path: "/admin/reels",
    icon: Video,
  },
  {
    label: "Reports",
    description: "Review reported users and content",
    path: "/admin/reports",
    icon: Flag,
  },
];

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
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-slate-700"
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
        <StatGridSkeleton count={6} />
      ) : null}

      {!loading || dashboard ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {activityLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <item.icon size={18} />
              </span>

              <ArrowRight
                size={17}
                className="mt-2 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200"
              />
            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-950 dark:text-white">
              {item.label}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboardPage;

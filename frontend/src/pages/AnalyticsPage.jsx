import {
  BarChart3,
  Eye,
  Film,
  Image,
  LineChart,
  RefreshCcw,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AnalyticsStatCard from "../features/analytics/components/AnalyticsStatCard";
import ProfileVisitsChart from "../features/analytics/components/ProfileVisitsChart";
import {
  fetchCreatorDashboardStats,
  fetchProfileVisitsAnalytics,
  resetAnalytics,
} from "../features/analytics/analyticsSlice";

const dayOptions = [7, 14, 30, 90];

const AnalyticsPage = () => {
  const dispatch = useDispatch();

  const { dashboardStats, profileVisits, loading, error } = useSelector(
    (state) => state.analytics,
  );

  const [days, setDays] = useState(30);

  useEffect(() => {
    dispatch(fetchCreatorDashboardStats(days));
    dispatch(fetchProfileVisitsAnalytics(days));

    return () => {
      dispatch(resetAnalytics());
    };
  }, [days, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCreatorDashboardStats(days));
    dispatch(fetchProfileVisitsAnalytics(days));
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track profile visits, impressions, and content performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {dayOptions.map((option) => (
              <option key={option} value={option}>
                Last {option} days
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
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

      {loading && !dashboardStats ? (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsStatCard
          icon={UserRound}
          label="Profile Visits"
          value={dashboardStats?.profileVisits}
          helper={`Last ${dashboardStats?.days || days} days`}
        />

        <AnalyticsStatCard
          icon={Eye}
          label="Total Impressions"
          value={dashboardStats?.totalImpressions}
          helper="Posts + reels + stories"
        />

        <AnalyticsStatCard
          icon={Image}
          label="Post Impressions"
          value={dashboardStats?.postImpressions}
        />

        <AnalyticsStatCard
          icon={Film}
          label="Reel Impressions"
          value={dashboardStats?.reelImpressions}
        />

        <AnalyticsStatCard
          icon={BarChart3}
          label="Story Impressions"
          value={dashboardStats?.storyImpressions}
        />

        <AnalyticsStatCard
          icon={Image}
          label="Total Posts"
          value={dashboardStats?.totalPosts}
        />

        <AnalyticsStatCard
          icon={Film}
          label="Total Reels"
          value={dashboardStats?.totalReels}
        />

        <AnalyticsStatCard
          icon={LineChart}
          label="Total Stories"
          value={dashboardStats?.totalStories}
        />
      </div>

      <ProfileVisitsChart visits={profileVisits} />
    </section>
  );
};

export default AnalyticsPage;

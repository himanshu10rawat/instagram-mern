import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Send,
  TrendingUp,
  X,
} from "lucide-react";

import AnalyticsStatCard from "./AnalyticsStatCard";

const getValue = (analytics, keys) => {
  const foundKey = keys.find((key) => analytics?.[key] !== undefined);

  return foundKey ? analytics[foundKey] : 0;
};

const InsightsModal = ({
  analytics,
  loading,
  onClose,
  open,
  type = "post",
}) => {
  if (!open) {
    return null;
  }

  const title = type === "reel" ? "Reel Insights" : "Post Insights";

  const views = getValue(analytics, ["views", "totalViews", "playCount"]);
  const impressions = getValue(analytics, [
    "impressions",
    "totalImpressions",
    "reach",
  ]);
  const likes = getValue(analytics, ["likes", "likesCount", "totalLikes"]);
  const comments = getValue(analytics, [
    "comments",
    "commentsCount",
    "totalComments",
  ]);
  const saves = getValue(analytics, ["saves", "savesCount", "totalSaves"]);
  const shares = getValue(analytics, ["shares", "sharesCount", "totalShares"]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <article className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Performance overview for this {type}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Close insights modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-sm text-slate-500">Loading insights...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnalyticsStatCard
                icon={Eye}
                label={type === "reel" ? "Views" : "Views"}
                value={views}
              />

              <AnalyticsStatCard
                icon={TrendingUp}
                label="Impressions"
                value={impressions}
              />

              <AnalyticsStatCard icon={Heart} label="Likes" value={likes} />

              <AnalyticsStatCard
                icon={MessageCircle}
                label="Comments"
                value={comments}
              />

              <AnalyticsStatCard icon={Bookmark} label="Saves" value={saves} />

              <AnalyticsStatCard icon={Send} label="Shares" value={shares} />
            </div>
          )}

          {!loading && !analytics ? (
            <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">
              No insights available yet.
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
};

export default InsightsModal;

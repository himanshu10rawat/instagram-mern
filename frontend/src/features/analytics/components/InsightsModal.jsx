import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Send,
  TrendingUp,
} from "lucide-react";

import ModalShell from "../../../components/ui/ModalShell";
import EmptyState from "../../../components/ui/EmptyState";
import { StatGridSkeleton } from "../../../components/ui/Skeleton";
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
    <ModalShell
      title={title}
      description={`Performance overview for this ${type}.`}
      onClose={onClose}
      className="max-w-3xl"
    >
      <article>
        <div className="p-5">
          {loading ? (
            <StatGridSkeleton count={6} />
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
            <EmptyState
              icon={TrendingUp}
              title="No insights available yet"
              description="Insights will appear after this content gets activity."
              variant="subtle"
              className="mt-4"
            />
          ) : null}
        </div>
      </article>
    </ModalShell>
  );
};

export default InsightsModal;

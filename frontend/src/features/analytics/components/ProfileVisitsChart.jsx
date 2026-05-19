import { BarChart3 } from "lucide-react";

import EmptyState from "../../../components/ui/EmptyState";

const getMaxVisits = (items) => {
  return Math.max(...items.map((item) => item.visits || 0), 1);
};

const formatDate = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const ProfileVisitsChart = ({ visits = [] }) => {
  const maxVisits = getMaxVisits(visits);

  if (!visits.length) {
    return (
      <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Profile Visits
        </h2>

        <EmptyState
          icon={BarChart3}
          title="No profile visit data yet"
          description="Profile visit trends will appear after people view your profile."
          variant="inline"
          size="sm"
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">
        Profile Visits
      </h2>

      <div className="mt-6 flex h-56 items-end gap-2 overflow-x-auto sm:h-64">
        {visits.map((item) => {
          const height = Math.max((item.visits / maxVisits) * 100, 8);

          return (
            <div
              key={item._id}
              className="flex min-w-10 flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {item.visits}
              </span>

              <div
                className="w-full rounded-t-xl bg-slate-950 dark:bg-white"
                style={{ height: `${height}%` }}
                title={`${item.visits} visits`}
              />

              <span className="whitespace-nowrap text-[10px] text-slate-500">
                {formatDate(item._id)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileVisitsChart;

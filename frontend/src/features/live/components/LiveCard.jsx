import { Radio, Users } from "lucide-react";
import { Link } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";

const LiveCard = ({ live }) => {
  const host = live.host || live.user || live.author;

  return (
    <Link
      to={`/live/${live._id}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-900">
        {live.coverImage?.url ? (
          <img
            src={live.coverImage.url}
            alt={live.title || "Live"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Radio className="text-red-500" size={42} />
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
          LIVE
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar src={host?.avatar?.url} alt={host?.username} />

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-950 dark:text-white">
              {live.title || "Live session"}
            </h2>

            <p className="truncate text-xs text-slate-500">
              @{host?.username || "user"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Users size={14} />
          {live.viewersCount || live.viewers?.length || 0} watching
        </div>
      </div>
    </Link>
  );
};

export default LiveCard;

import { Check, UserPlus, X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/Skeleton";
import {
  acceptFollowRequest,
  fetchFollowRequests,
  rejectFollowRequest,
} from "../features/follow/followSlice";

const FollowRequestsPage = () => {
  const dispatch = useDispatch();

  const { requests, loading, error } = useSelector((state) => state.follow);

  useEffect(() => {
    dispatch(fetchFollowRequests());
  }, [dispatch]);

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Follow Requests
        </h1>

        {loading ? (
          <div className="mt-6">
            <ListSkeleton count={4} />
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && requests.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No follow requests"
            description="New follow requests will appear here."
            className="mt-6"
          />
        ) : null}

        <div className="mt-6 space-y-4">
          {!loading
            ? requests.map((request) => {
                const user =
                  request.sender || request.requestedBy || request.user;

                return (
                  <div
                    key={request._id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:rounded-2xl sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={user?.avatar?.url} alt={user?.username} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {user?.username || "Unknown user"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {user?.fullName || "Wants to follow you"}
                        </p>
                      </div>
                    </div>

                    <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto sm:flex">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(acceptFollowRequest(request._id))
                        }
                        className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950 sm:min-w-11"
                        aria-label="Accept request"
                      >
                        <Check size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          dispatch(rejectFollowRequest(request._id))
                        }
                        className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:min-w-11"
                        aria-label="Reject request"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </section>
  );
};

export default FollowRequestsPage;

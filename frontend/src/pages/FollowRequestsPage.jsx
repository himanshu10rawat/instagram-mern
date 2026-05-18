import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Follow Requests
        </h1>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Loading requests...
          </p>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && requests.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            No follow requests.
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {requests.map((request) => {
            const user = request.sender || request.requestedBy || request.user;

            return (
              <div
                key={request._id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user?.avatar?.url} alt={user?.username} />

                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {user?.username || "Unknown user"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.fullName || "Wants to follow you"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => dispatch(acceptFollowRequest(request._id))}
                    className="rounded-xl bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950"
                    aria-label="Accept request"
                  >
                    <Check size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => dispatch(rejectFollowRequest(request._id))}
                    className="rounded-xl border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    aria-label="Reject request"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FollowRequestsPage;

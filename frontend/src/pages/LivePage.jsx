import { Plus, Radio, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LiveCard from "../features/live/components/LiveCard";
import { fetchActiveLives, startLive } from "../features/live/liveSlice";

const LivePage = () => {
  const dispatch = useDispatch();

  const { activeLives, actionLoading, error, loading } = useSelector(
    (state) => state.live,
  );

  const [title, setTitle] = useState("");

  useEffect(() => {
    dispatch(fetchActiveLives());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchActiveLives());
  };

  const handleStartLive = async (event) => {
    event.preventDefault();

    if (!title.trim()) return;

    const result = await dispatch(
      startLive({
        title: title.trim(),
      }),
    );

    if (startLive.fulfilled.match(result)) {
      window.location.assign(`/live/${result.payload._id}?role=host`);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Live
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Start a live session or join active live streams.
          </p>
        </div>

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

      <form
        onSubmit={handleStartLive}
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-4 flex items-center gap-3">
          <Radio className="text-red-600" size={22} />

          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Go Live
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Live title..."
            className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="submit"
            disabled={actionLoading || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus size={18} />
            {actionLoading ? "Starting..." : "Start Live"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading live sessions...</p>
      ) : null}

      {!loading && activeLives.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <Radio className="mx-auto text-slate-400" size={42} />

          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            No one is live right now
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Start your own live session.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeLives.map((live) => (
          <LiveCard key={live._id} live={live} />
        ))}
      </div>
    </section>
  );
};

export default LivePage;

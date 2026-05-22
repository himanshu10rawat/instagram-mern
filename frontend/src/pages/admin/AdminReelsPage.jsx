import {
  Bookmark,
  Clapperboard,
  ExternalLink,
  Eye,
  Hash,
  Heart,
  MapPin,
  MessageCircle,
  Music2,
  RefreshCcw,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import { CardListSkeleton } from "../../components/ui/Skeleton";
import {
  deleteAdminReel,
  fetchAdminReels,
  resetAdmin,
} from "../../features/admin/adminSlice";

const PAGE_SIZE = 20;

const formatDate = (value) => {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getAuthorName = (author) => {
  if (!author || author.isDeleted) return "Deleted user";

  return `@${author.username}`;
};

const getReelPreview = (reel) => {
  return reel.video?.thumbnailUrl || reel.video?.optimizedUrl || "";
};

const ContentMetric = ({ icon: Icon, label, value }) => (
  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
    <Icon size={14} />
    {Number(value) || 0} {label}
  </span>
);

const AdminReelsPage = () => {
  const dispatch = useDispatch();
  const { reels, pagination, loading, actionLoading, error, successMessage } =
    useSelector((state) => state.admin);

  const [searchValue, setSearchValue] = useState("");

  const loadReels = (page = 1) => {
    dispatch(
      fetchAdminReels({
        page,
        limit: PAGE_SIZE,
        search: searchValue.trim(),
      }),
    );
  };

  useEffect(() => {
    dispatch(fetchAdminReels({ page: 1, limit: PAGE_SIZE }));

    return () => {
      dispatch(resetAdmin());
    };
  }, [dispatch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadReels(1);
  };

  const handleRemoveReel = (reel) => {
    const confirmed = window.confirm("Remove this reel?");

    if (!confirmed) return;

    dispatch(deleteAdminReel(reel._id));
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Reels Activity
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review reels, creators, hashtags, audio, views, and shares.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReels(pagination?.page || 1)}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-slate-700"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="grid gap-2 sm:flex sm:gap-3">
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search caption, hashtag, audio, location, or creator..."
          className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:text-sm"
        />

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          <Search size={18} />
          Search
        </button>
      </form>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {successMessage}
        </div>
      ) : null}

      <div className="space-y-4">
        {loading ? <CardListSkeleton count={4} /> : null}

        {!loading && reels.length === 0 ? (
          <EmptyState
            icon={Clapperboard}
            title="No reels found"
            description="Reels matching this search will appear here."
          />
        ) : null}

        {reels.map((reel) => {
          const preview = getReelPreview(reel);

          return (
            <article
              key={reel._id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                  <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 sm:w-24">
                    {preview ? (
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Clapperboard className="text-slate-400" size={28} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={reel.author?.avatar?.url}
                        alt={reel.author?.username}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {getAuthorName(reel.author)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDate(reel.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">
                      {reel.caption || "No caption"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {reel.audioName ? (
                        <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                          <Music2 size={13} />
                          {reel.audioName}
                        </span>
                      ) : null}

                      {reel.location ? (
                        <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                          <MapPin size={13} />
                          {reel.location}
                        </span>
                      ) : null}

                      {reel.hashtags?.slice(0, 4).map((hashtag) => (
                        <span
                          key={hashtag}
                          className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <Hash size={13} />
                          {hashtag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <ContentMetric
                        icon={Eye}
                        label="views"
                        value={reel.viewsCount}
                      />
                      <ContentMetric
                        icon={Heart}
                        label="likes"
                        value={reel.likes?.length}
                      />
                      <ContentMetric
                        icon={MessageCircle}
                        label="comments"
                        value={reel.commentsCount}
                      />
                      <ContentMetric
                        icon={Bookmark}
                        label="saves"
                        value={reel.savedBy?.length}
                      />
                      <ContentMetric
                        icon={Share2}
                        label="shares"
                        value={reel.sharesCount}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid shrink-0 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                  <Link
                    to={`/reels/${reel._id}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
                  >
                    <ExternalLink size={16} />
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemoveReel(reel)}
                    disabled={actionLoading}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {pagination?.totalPages > 1 ? (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages} -{" "}
            {pagination.total} reels
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => loadReels(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
              className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => loadReels(pagination.page + 1)}
              disabled={loading || pagination.page >= pagination.totalPages}
              className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AdminReelsPage;

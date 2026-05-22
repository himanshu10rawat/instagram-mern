import {
  Bookmark,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import { CardListSkeleton } from "../../components/ui/Skeleton";
import {
  deleteAdminPost,
  fetchAdminPosts,
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

const getPostPreview = (post) => {
  const media = post.media?.[0];

  if (!media) return "";

  return media.thumbnailUrl || media.optimizedUrl || media.url || "";
};

const ContentMetric = ({ icon: Icon, label, value }) => (
  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
    <Icon size={14} />
    {Number(value) || 0} {label}
  </span>
);

const AdminPostsPage = () => {
  const dispatch = useDispatch();
  const { posts, pagination, loading, actionLoading, error, successMessage } =
    useSelector((state) => state.admin);

  const [searchValue, setSearchValue] = useState("");

  const loadPosts = (page = 1) => {
    dispatch(
      fetchAdminPosts({
        page,
        limit: PAGE_SIZE,
        search: searchValue.trim(),
      }),
    );
  };

  useEffect(() => {
    dispatch(fetchAdminPosts({ page: 1, limit: PAGE_SIZE }));

    return () => {
      dispatch(resetAdmin());
    };
  }, [dispatch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadPosts(1);
  };

  const handleRemovePost = (post) => {
    const confirmed = window.confirm("Remove this post?");

    if (!confirmed) return;

    dispatch(deleteAdminPost(post._id));
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Posts Activity
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review user posts, authors, locations, tags, and engagement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadPosts(pagination?.page || 1)}
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
          placeholder="Search caption, tag, location, or author..."
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

        {!loading && posts.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No posts found"
            description="Posts matching this search will appear here."
          />
        ) : null}

        {posts.map((post) => {
          const preview = getPostPreview(post);

          return (
            <article
              key={post._id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                  <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 sm:w-28">
                    {preview ? (
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-slate-400" size={28} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={post.author?.avatar?.url}
                        alt={post.author?.username}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {getAuthorName(post.author)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">
                      {post.caption || "No caption"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.location ? (
                        <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                          <MapPin size={13} />
                          {post.location}
                        </span>
                      ) : null}

                      {post.tags?.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <Tag size={13} />
                          {tag}
                        </span>
                      ))}

                      {post.isArchived ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                          Archived
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <ContentMetric
                        icon={Heart}
                        label="likes"
                        value={post.likes?.length}
                      />
                      <ContentMetric
                        icon={MessageCircle}
                        label="comments"
                        value={post.commentsCount}
                      />
                      <ContentMetric
                        icon={Bookmark}
                        label="saves"
                        value={post.savedBy?.length}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid shrink-0 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                  <Link
                    to={`/posts/${post._id}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
                  >
                    <ExternalLink size={16} />
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemovePost(post)}
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
            {pagination.total} posts
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => loadPosts(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
              className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => loadPosts(pagination.page + 1)}
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

export default AdminPostsPage;

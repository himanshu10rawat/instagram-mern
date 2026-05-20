import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  BarChart3,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";

import InsightsModal from "../../analytics/components/InsightsModal";
import Avatar from "../../../components/common/Avatar";
import ShareModal from "../../messages/components/ShareModal";
import ReportModal from "../../safety/components/ReportModal";
import SaveToCollectionModal from "../../collections/components/SaveToCollectionModal";
import { likePost, savePost } from "../postSlice";
import {
  fetchPostAnalytics,
  resetAnalyticsDetails,
} from "../../analytics/analyticsSlice";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const PostCard = ({ post }) => {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { detailLoading, postAnalytics } = useSelector(
    (state) => state.analytics,
  );

  const isOwnPost = post.author?._id === currentUser?._id;
  const currentUserId = currentUser?._id;
  const isLiked = post.likes?.some((id) => getId(id) === currentUserId);
  const isSaved = post.savedBy?.some((id) => getId(id) === currentUserId);

  const firstMedia = post.media?.[0];

  const handleViewInsights = () => {
    if (!post?._id) return;

    dispatch(resetAnalyticsDetails());
    dispatch(fetchPostAnalytics(post._id));
    setShowPostMenu(false);
    setShowInsightsModal(true);
  };

  return (
    <article className="post-card mobile-edge overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl">
      <header className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author?.avatar?.url}
            alt={post.author?.username}
            size="md"
          />
          <div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
              {post.author?.username || "unknown"}
            </h3>
            {post.location ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {post.location}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPostMenu((prev) => !prev)}
            className="min-h-11 min-w-11 rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Post options"
          >
            <MoreHorizontal size={20} />
          </button>

          {showPostMenu ? (
            <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
              {isOwnPost ? (
                <button
                  type="button"
                  onClick={handleViewInsights}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <BarChart3 size={16} />
                  View insights
                </button>
              ) : null}

              {!isOwnPost ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowPostMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Report post
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className="bg-slate-100 dark:bg-slate-900">
        {firstMedia?.type === "video" ? (
          <video
            src={firstMedia.optimizedUrl || firstMedia.url}
            controls
            preload="metadata"
            poster={firstMedia.thumbnailUrl}
            className="max-h-[60vh] w-full object-cover"
          />
        ) : firstMedia?.url ? (
          <img
            src={firstMedia.optimizedUrl || firstMedia.url}
            alt={post.caption || "Post"}
            loading="lazy"
            decoding="async"
            className="max-h-[60vh] w-full object-cover"
          />
        ) : (
          <div className="aspect-square w-full bg-slate-100 dark:bg-slate-900"></div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={async () => {
                if (likeLoading) return;
                setLikeLoading(true);

                try {
                  await dispatch(likePost({ postId: post._id, isLiked }));
                } finally {
                  setLikeLoading(false);
                }
              }}
              className={
                isLiked
                  ? "flex min-h-11 min-w-11 items-center justify-center text-red-500"
                  : "flex min-h-11 min-w-11 items-center justify-center text-slate-900 dark:text-slate-100"
              }
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              {likeLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              )}
            </button>

            <Link
              to={`/posts/${post._id}`}
              className="flex min-h-11 min-w-11 items-center justify-center text-slate-900 dark:text-slate-100"
            >
              <MessageCircle size={24} />
            </Link>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex min-h-11 min-w-11 items-center justify-center"
            >
              <Send size={24} />
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (saveLoading) return;
              setSaveLoading(true);

              try {
                if (!isSaved) {
                  await dispatch(savePost({ postId: post._id, isSaved }));
                }
                setShowCollectionModal(true);
              } finally {
                setSaveLoading(false);
              }
            }}
            className={`flex min-h-11 min-w-11 items-center justify-center ${
              isSaved ? "text-slate-950 dark:text-white" : "text-slate-700"
            }`}
            aria-label={isSaved ? "Saved" : "Save post"}
          >
            {saveLoading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
            )}
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
          {post.likes?.length || 0} likes
        </p>

        {post.caption ? (
          <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">
            <span className="font-semibold">{post.author?.username}</span>{" "}
            {post.caption}
          </p>
        ) : null}

        <Link
          to={`/posts/${post._id}`}
          className="mt-2 block text-sm text-slate-500 dark:text-slate-400"
        >
          View all {post.commentsCount || post.comments?.length || 0} comments
        </Link>
      </div>
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        sharePayload={{
          type: "post",
          postId: post._id,
        }}
      />

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={post._id}
        type="post"
      />

      <SaveToCollectionModal
        open={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        postId={post._id}
      />

      <InsightsModal
        analytics={postAnalytics}
        loading={detailLoading}
        onClose={() => setShowInsightsModal(false)}
        open={showInsightsModal}
        type="post"
      />
    </article>
  );
};

export default PostCard;

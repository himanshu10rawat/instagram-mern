import {
  BarChart3,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";
import CommentThread from "../../../components/common/CommentThread";
import ShareModal from "../../messages/components/ShareModal";
import ReportModal from "../../safety/components/ReportModal";
import {
  commentReel,
  fetchReelComments,
  likeReel,
  saveReel,
} from "../reelSlice";
import InsightsModal from "../../analytics/components/InsightsModal";
import {
  fetchReelAnalytics,
  resetAnalyticsDetails,
} from "../../analytics/analyticsSlice";

const ReelCard = ({ reel }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const { commentsLoading } = useSelector((state) => state.reels);
  const { detailLoading, reelAnalytics } = useSelector(
    (state) => state.analytics,
  );

  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReelMenu, setShowReelMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const commentInputRef = useRef(null);

  const isOwnReel = reel.author?._id === currentUser?._id;
  const authorProfilePath = reel.author?.username
    ? `/profile/${reel.author.username}`
    : "";

  useEffect(() => {
    if (showCommentBox && reel?._id && !Array.isArray(reel.comments)) {
      dispatch(fetchReelComments(reel._id));
    }
  }, [dispatch, reel?._id, reel.comments, showCommentBox]);

  const isLiked = reel.likes?.some((like) => {
    if (typeof like === "string") return like === currentUser?._id;
    return like?._id === currentUser?._id;
  });

  const isSaved = reel.savedBy?.some((savedUser) => {
    if (typeof savedUser === "string") return savedUser === currentUser?._id;
    return savedUser?._id === currentUser?._id;
  });

  const handleVideoClick = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;

    setCommentSubmitting(true);

    try {
      const result = await dispatch(
        commentReel({
          reelId: reel._id,
          text: commentText.trim(),
          parentComment: replyTarget?._id,
        }),
      );

      if (commentReel.fulfilled.match(result)) {
        setCommentText("");
        setReplyTarget(null);
      }
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setShowCommentBox(true);
    setReplyTarget(comment);
    commentInputRef.current?.focus();
  };

  const replyUsername =
    replyTarget?.author?.username || replyTarget?.user?.username || "user";

  const handleViewInsights = () => {
    if (!reel?._id) return;

    dispatch(resetAnalyticsDetails());
    dispatch(fetchReelAnalytics(reel._id));
    setShowReelMenu(false);
    setShowInsightsModal(true);
  };

  return (
    <article className="relative mx-auto flex h-[calc(100dvh-9rem)] min-h-120 w-full max-w-md snap-start overflow-hidden rounded-xl bg-black text-white md:h-[calc(100dvh-3rem)] md:max-h-205 md:min-h-155 md:rounded-2xl">
      <button
        type="button"
        onClick={handleVideoClick}
        className="absolute inset-0 z-10"
        aria-label="Play or pause reel"
      />

      <video
        ref={videoRef}
        src={reel.video?.optimizedUrl || reel.video?.url || reel.media?.url}
        className="h-full w-full object-cover"
        muted={isMuted}
        loop
        playsInline
        autoPlay
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4">
        <div className="pointer-events-auto flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {authorProfilePath ? (
                <Link
                  to={authorProfilePath}
                  aria-label={`View ${reel.author?.username}'s profile`}
                >
                  <Avatar
                    src={reel.author?.avatar?.url}
                    alt={reel.author?.username}
                    size="sm"
                  />
                </Link>
              ) : (
                <Avatar
                  src={reel.author?.avatar?.url}
                  alt={reel.author?.username}
                  size="sm"
                />
              )}

              {authorProfilePath ? (
                <Link
                  to={authorProfilePath}
                  className="text-sm font-semibold hover:underline"
                >
                  {reel.author?.username || "unknown"}
                </Link>
              ) : (
                <p className="text-sm font-semibold">
                  {reel.author?.username || "unknown"}
                </p>
              )}
            </div>

            {reel.caption ? (
              <p className="mt-3 max-h-10 overflow-hidden text-sm">
                {reel.caption}
              </p>
            ) : null}

            {reel.location ? (
              <p className="mt-1 text-xs text-white/70">{reel.location}</p>
            ) : null}
          </div>

          <div className="pointer-events-auto flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => dispatch(likeReel({ reelId: reel._id, isLiked }))}
              className="flex flex-col items-center gap-1"
            >
              <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-xs">{reel.likes?.length || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCommentBox((prev) => !prev);
                setReplyTarget(null);
              }}
              className="flex flex-col items-center gap-1"
            >
              <MessageCircle size={28} />
              <span className="text-xs">
                {reel.commentsCount || reel.comments?.length || 0}
              </span>
            </button>

            <button type="button" onClick={() => setShowShareModal(true)}>
              <Send size={28} />
            </button>

            <button
              type="button"
              onClick={() => dispatch(saveReel({ reelId: reel._id, isSaved }))}
            >
              <Bookmark size={28} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <button type="button" onClick={handleMuteToggle}>
              {isMuted ? <VolumeX size={26} /> : <Volume2 size={26} />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReelMenu((prev) => !prev)}
                aria-label="Reel options"
              >
                <MoreHorizontal size={26} />
              </button>

              {showReelMenu ? (
                <div className="absolute bottom-10 right-0 z-30 w-44 overflow-hidden rounded-xl bg-white text-slate-950 shadow-xl">
                  {isOwnReel ? (
                    <button
                      type="button"
                      onClick={handleViewInsights}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <BarChart3 size={16} />
                      View insights
                    </button>
                  ) : null}

                  {!isOwnReel ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowReelMenu(false);
                        setShowReportModal(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Report reel
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showCommentBox ? (
          <div className="pointer-events-auto mt-4 rounded-2xl bg-white/95 p-3 text-slate-950 shadow-2xl backdrop-blur dark:bg-slate-950/95 dark:text-white">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                Comments ({reel.commentsCount || reel.comments?.length || 0})
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowCommentBox(false);
                  setReplyTarget(null);
                }}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                aria-label="Close comments"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[34dvh] overflow-y-auto pr-1">
              {commentsLoading && !Array.isArray(reel.comments) ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Loading comments...
                </p>
              ) : (
                <CommentThread
                  comments={reel.comments || []}
                  emptyText="No comments yet. Start the conversation."
                  onReply={handleReply}
                />
              )}
            </div>

            {replyTarget ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <span className="min-w-0 truncate">
                  Replying to @{replyUsername}
                </span>

                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="min-h-0 font-semibold text-slate-950 dark:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
              <input
                ref={commentInputRef}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                disabled={commentSubmitting}
                placeholder={
                  replyTarget
                    ? `Reply to @${replyUsername}...`
                    : "Add a comment..."
                }
                className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-500 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                {commentSubmitting ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        sharePayload={{
          type: "reel",
          reelId: reel._id,
        }}
      />

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={reel._id}
        type="reel"
      />

      <InsightsModal
        analytics={reelAnalytics}
        loading={detailLoading}
        onClose={() => setShowInsightsModal(false)}
        open={showInsightsModal}
        type="reel"
      />
    </article>
  );
};

export default ReelCard;

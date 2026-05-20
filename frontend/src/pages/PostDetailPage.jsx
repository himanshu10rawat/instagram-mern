import {
  Bookmark,
  Heart,
  MessageCircle,
  Send,
  Archive,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
import CommentThread from "../components/common/CommentThread";
import { PostDetailSkeleton } from "../components/ui/Skeleton";
import EditCaptionModal from "../features/posts/components/EditCaptionModal";
import {
  clearCurrentPost,
  commentPost,
  fetchSinglePost,
  likePost,
  savePost,
  archivePost,
  deletePost,
  unarchivePost,
} from "../features/posts/postSlice";

const isUserIncluded = (list = [], userId) => {
  return list.some((item) => {
    if (typeof item === "string") return item === userId;
    return item?._id === userId;
  });
};

const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditCaption, setShowEditCaption] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const { currentPost, loading, error } = useSelector((state) => state.posts);

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchSinglePost(postId));

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;

    setCommentSubmitting(true);

    try {
      const result = await dispatch(
        commentPost({
          postId,
          text: commentText.trim(),
          parentComment: replyTarget?._id,
        }),
      );

      if (commentPost.fulfilled.match(result)) {
        setCommentText("");
        setReplyTarget(null);
      }
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTarget(comment);
    commentInputRef.current?.focus();
  };

  const replyUsername =
    replyTarget?.author?.username || replyTarget?.user?.username || "user";

  if (loading && !currentPost) {
    return <PostDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!currentPost) {
    return null;
  }

  const firstMedia = currentPost.media?.[0];
  const isLiked = isUserIncluded(currentPost.likes, currentUser?._id);
  const isSaved = isUserIncluded(currentPost.savedBy, currentUser?._id);
  const isOwner = currentPost.author?._id === currentUser?._id;

  return (
    <section className="mx-auto max-w-6xl">
      <article className="mobile-edge grid overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-h-80 items-center justify-center bg-black sm:min-h-130">
          {firstMedia?.type === "video" ? (
            <video
              src={firstMedia.optimizedUrl || firstMedia.url}
              controls
              className="max-h-190 w-full object-contain"
            />
          ) : (
            <img
              src={firstMedia?.optimizedUrl || firstMedia?.url}
              alt={currentPost.caption || "Post"}
              className="max-h-190 w-full object-contain"
            />
          )}
        </div>

        <div className="flex min-h-0 flex-col sm:min-h-130">
          <header className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800 sm:p-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentPost.author?.avatar?.url}
                alt={currentPost.author?.username}
              />

              <div className="min-w-0">
                <Link
                  to={`/profile/${currentPost.author?.username}`}
                  className="text-sm font-semibold text-slate-950 dark:text-white"
                >
                  {currentPost.author?.username || "unknown"}
                </Link>

                {currentPost.location ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentPost.location}
                  </p>
                ) : null}
              </div>
            </div>

            {isOwner ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="min-h-11 min-w-11 rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <MoreHorizontal size={20} />
                </button>

                {showMenu ? (
                  <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditCaption(true);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Pencil size={16} />
                      Edit caption
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (currentPost.isArchived) {
                          dispatch(unarchivePost(currentPost._id));
                        } else {
                          dispatch(archivePost(currentPost._id));
                        }

                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Archive size={16} />
                      {currentPost.isArchived ? "Unarchive" : "Archive"}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const result = await dispatch(
                          deletePost(currentPost._id),
                        );

                        if (deletePost.fulfilled.match(result)) {
                          navigate("/profile/me");
                        }
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {currentPost.caption ? (
              <div className="mb-5 flex gap-3">
                <Avatar
                  src={currentPost.author?.avatar?.url}
                  alt={currentPost.author?.username}
                  size="sm"
                />

                <p className="text-sm text-slate-800 dark:text-slate-200">
                  <span className="font-semibold text-slate-950 dark:text-white">
                    {currentPost.author?.username}
                  </span>{" "}
                  {currentPost.caption}
                </p>
              </div>
            ) : null}

            <CommentThread
              comments={currentPost.comments || []}
              emptyText="No comments yet. Start the conversation."
              onReply={handleReply}
            />
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(likePost({ postId: currentPost._id, isLiked }))
                  }
                  className={
                    isLiked
                      ? "flex min-h-11 min-w-11 items-center justify-center text-red-500"
                      : "flex min-h-11 min-w-11 items-center justify-center text-slate-950 dark:text-white"
                  }
                >
                  <Heart size={25} fill={isLiked ? "currentColor" : "none"} />
                </button>

                <span className="flex min-h-11 min-w-11 items-center justify-center">
                  <MessageCircle
                    size={25}
                    className="text-slate-950 dark:text-white"
                  />
                </span>

                <span className="flex min-h-11 min-w-11 items-center justify-center">
                  <Send size={25} className="text-slate-950 dark:text-white" />
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  dispatch(savePost({ postId: currentPost._id, isSaved }))
                }
                className={
                  isSaved
                    ? "flex min-h-11 min-w-11 items-center justify-center text-slate-950 dark:text-white"
                    : "flex min-h-11 min-w-11 items-center justify-center text-slate-600 dark:text-slate-300"
                }
              >
                <Bookmark size={25} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
              {currentPost.likes?.length || 0} likes
            </p>

            {replyTarget ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
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

            <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2 sm:gap-3">
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
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white sm:text-sm"
              />

              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="min-h-12 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {commentSubmitting ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      </article>
      {showEditCaption ? (
        <EditCaptionModal
          post={currentPost}
          onClose={() => setShowEditCaption(false)}
        />
      ) : null}
    </section>
  );
};

export default PostDetailPage;

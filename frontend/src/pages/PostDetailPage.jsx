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
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
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
  const { currentPost, loading, actionLoading, error } = useSelector(
    (state) => state.posts,
  );

  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    dispatch(fetchSinglePost(postId));

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;

    const result = await dispatch(
      commentPost({
        postId,
        text: commentText.trim(),
      }),
    );

    if (commentPost.fulfilled.match(result)) {
      setCommentText("");
    }
  };

  if (loading && !currentPost) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Loading post...
      </p>
    );
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
      <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-h-130 items-center justify-center bg-black">
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

        <div className="flex min-h-130 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
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
                  className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
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

          <div className="flex-1 overflow-y-auto p-4">
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

            <div className="space-y-4">
              {(currentPost.comments || []).map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar
                    src={comment.author?.avatar?.url || comment.user?.avatar?.url}
                    alt={comment.author?.username || comment.user?.username}
                    size="sm"
                  />

                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      <span className="font-semibold text-slate-950 dark:text-white">
                        {comment.author?.username ||
                          comment.user?.username ||
                          "user"}
                      </span>{" "}
                      {comment.text}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(likePost({ postId: currentPost._id, isLiked }))
                  }
                  className={
                    isLiked
                      ? "text-red-500"
                      : "text-slate-950 dark:text-white"
                  }
                >
                  <Heart size={25} fill={isLiked ? "currentColor" : "none"} />
                </button>

                <MessageCircle
                  size={25}
                  className="text-slate-950 dark:text-white"
                />

                <Send size={25} className="text-slate-950 dark:text-white" />
              </div>

              <button
                type="button"
                onClick={() =>
                  dispatch(savePost({ postId: currentPost._id, isSaved }))
                }
                className={
                  isSaved
                    ? "text-slate-950 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }
              >
                <Bookmark size={25} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
              {currentPost.likes?.length || 0} likes
            </p>

            <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-3">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white"
              />

              <button
                type="submit"
                disabled={actionLoading || !commentText.trim()}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Post
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

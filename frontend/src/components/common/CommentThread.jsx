import { Link } from "react-router-dom";

import Avatar from "./Avatar";

const getCommentAuthor = (comment) => comment.author || comment.user || {};

const formatCommentTime = (createdAt) => {
  if (!createdAt) return "";

  return new Date(createdAt).toLocaleString();
};

const CommentItem = ({ comment, onReply, depth = 0 }) => {
  const author = getCommentAuthor(comment);
  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  const authorProfilePath = author.username
    ? `/profile/${author.username}`
    : "";
  const indentClass =
    depth > 0
      ? "ml-8 border-l border-slate-200 pl-3 dark:border-slate-800"
      : "";

  return (
    <div className={indentClass}>
      <div className="flex gap-3">
        {authorProfilePath ? (
          <Link
            to={authorProfilePath}
            aria-label={`View ${author.username}'s profile`}
          >
            <Avatar src={author.avatar?.url} alt={author.username} size="sm" />
          </Link>
        ) : (
          <Avatar src={author.avatar?.url} alt={author.username} size="sm" />
        )}

        <div className="min-w-0 flex-1">
          <p className="wrap-break-word text-sm text-slate-800 dark:text-slate-200">
            {authorProfilePath ? (
              <Link
                to={authorProfilePath}
                className="font-semibold text-slate-950 hover:underline dark:text-white"
              >
                {author.username || "user"}
              </Link>
            ) : (
              <span className="font-semibold text-slate-950 dark:text-white">
                {author.username || "user"}
              </span>
            )}{" "}
            {comment.text}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatCommentTime(comment.createdAt)}</span>

            <button
              type="button"
              onClick={() => onReply(comment)}
              className="min-h-0 font-semibold hover:text-slate-950 dark:hover:text-white"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 ? (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const CommentThread = ({
  comments = [],
  emptyText = "No comments yet.",
  onReply = () => {},
}) => {
  if (!comments.length) {
    return (
      <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} onReply={onReply} />
      ))}
    </div>
  );
};

export default CommentThread;

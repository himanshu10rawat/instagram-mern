import { Check, Trash2, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";

const getNotificationActionText = (notification) => {
  const messages = {
    follow: "started following you",
    follow_request: "requested to follow you",
    like: "liked your post",
    comment: "commented on your post",
    story_like: "liked your story",
    story_reply: "replied to your story",
    reel_like: "liked your reel",
    reel_comment: "commented on your reel",
    message: "sent you a message",
    mention: "mentioned you",
    tag: "tagged you in a post",
  };

  return messages[notification.type] || "sent you a notification";
};

const getNotificationLink = (notification) => {
  if (notification.post?._id) return `/posts/${notification.post._id}`;
  if (notification.reel?._id) return `/reels/${notification.reel._id}`;
  if (notification.story?._id) return `/stories/${notification.story._id}`;
  if (notification.type === "message" && notification.sender?._id) {
    return `/messages?user=${notification.sender._id}`;
  }
  return "/notifications";
};

const getTargetLabel = (notification) => {
  if (notification.post?._id) return "View post";
  if (notification.reel?._id) return "View reel";
  if (notification.story?._id) return "View story";
  if (notification.type === "message" && notification.sender?._id) {
    return "Open chat";
  }

  return "";
};

const NotificationItem = ({
  notification,
  onAcceptRequest,
  onDelete,
  onRead,
  onRejectRequest,
  processingRequestId,
}) => {
  const location = useLocation();
  const followRequestId = notification.followRequest?._id;
  const senderUsername = notification.sender?.username || "Someone";
  const senderProfileLink = notification.sender?.username
    ? `/profile/${notification.sender.username}`
    : "";
  const targetLink = getNotificationLink(notification);
  const targetLabel = getTargetLabel(notification);
  const canRespond =
    notification.type === "follow_request" &&
    notification.followRequest?.status === "pending" &&
    followRequestId;
  const storyReturnState = {
    storyReturnTo: `${location.pathname}${location.search}`,
  };
  const targetState = notification.story?._id ? storyReturnState : undefined;
  const isProcessing = processingRequestId === followRequestId;
  const handleRead = () => {
    if (!notification.isRead) {
      onRead(notification._id);
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:p-4 ${
        notification.isRead
          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
          : "border-blue-100 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {senderProfileLink ? (
          <Link to={senderProfileLink} onClick={handleRead} className="shrink-0">
            <Avatar
              src={notification.sender?.avatar?.url}
              alt={notification.sender?.username}
              size="md"
            />
          </Link>
        ) : (
          <Avatar
            src={notification.sender?.avatar?.url}
            alt={notification.sender?.username}
            size="md"
          />
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {senderProfileLink ? (
              <Link
                to={senderProfileLink}
                onClick={handleRead}
                className="font-bold hover:underline"
              >
                {senderUsername}
              </Link>
            ) : (
              <span className="font-bold">{senderUsername}</span>
            )}{" "}
            {getNotificationActionText(notification)}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : ""}
            </span>

            {targetLabel && targetLink !== "/notifications" ? (
              <Link
                to={targetLink}
                state={targetState}
                onClick={handleRead}
                className="font-semibold text-slate-700 hover:underline dark:text-slate-200"
              >
                {targetLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {canRespond ? (
          <>
            <button
              type="button"
              onClick={() => onAcceptRequest({ notification, followRequestId })}
              disabled={isProcessing}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              <Check size={16} />
              Accept
            </button>

            <button
              type="button"
              onClick={() => onRejectRequest({ notification, followRequestId })}
              disabled={isProcessing}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
            >
              <X size={16} />
              Decline
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => onDelete(notification._id)}
          className="min-h-10 min-w-10 rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          aria-label="Delete notification"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;

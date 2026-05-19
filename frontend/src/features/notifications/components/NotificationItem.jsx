import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Avatar from "../../../components/common/Avatar";

const getNotificationText = (notification) => {
  const username = notification.sender?.username || "Someone";

  const messages = {
    follow: `${username} started following you`,
    follow_request: `${username} requested to follow you`,
    like: `${username} liked your post`,
    comment: `${username} commented on your post`,
    story_like: `${username} liked your story`,
    story_reply: `${username} replied to your story`,
    reel_like: `${username} liked your reel`,
    reel_comment: `${username} commented on your reel`,
    message: `${username} sent you a message`,
    mention: `${username} mentioned you`,
    tag: `${username} tagged you in a post`,
  };

  return messages[notification.type] || `${username} sent you a notification`;
};

const getNotificationLink = (notification) => {
  if (notification.post?._id) return `/posts/${notification.post._id}`;
  if (notification.reel?._id) return `/reels/${notification.reel._id}`;
  if (notification.story?._id) return `/stories/${notification.story._id}`;
  if (notification.type === "message" && notification.sender?._id) {
    return `/messages?user=${notification.sender._id}`;
  }
  if (notification.sender?.username)
    return `/profile/${notification.sender.username}`;

  return "/notifications";
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border p-3 sm:items-center sm:gap-4 sm:rounded-2xl sm:p-4 ${
        notification.isRead
          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
          : "border-blue-100 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
      }`}
    >
      <Link
        to={getNotificationLink(notification)}
        onClick={() => {
          if (!notification.isRead) {
            onRead(notification._id);
          }
        }}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar
          src={notification.sender?.avatar?.url}
          alt={notification.sender?.username}
          size="md"
        />

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {getNotificationText(notification)}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : ""}
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => onDelete(notification._id)}
        className="min-h-11 min-w-11 rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        aria-label="Delete notification"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default NotificationItem;

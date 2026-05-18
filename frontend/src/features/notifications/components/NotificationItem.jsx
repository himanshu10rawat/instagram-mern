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
    mention: `${username} mentioned you`,
    tag: `${username} tagged you in a post`,
  };

  return messages[notification.type] || `${username} sent you a notification`;
};

const getNotificationLink = (notification) => {
  if (notification.post?._id) return `/posts/${notification.post._id}`;
  if (notification.reel?._id) return `/reels/${notification.reel._id}`;
  if (notification.story?._id) return `/stories/${notification.story._id}`;
  if (notification.sender?.username)
    return `/profile/${notification.sender.username}`;

  return "/notifications";
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
        notification.isRead
          ? "border-slate-200 bg-white"
          : "border-blue-100 bg-blue-50"
      }`}
    >
      <Link
        to={getNotificationLink(notification)}
        onClick={() => {
          if (!notification.isRead) {
            onRead(notification._id);
          }
        }}
        className="flex flex-1 items-center gap-3"
      >
        <Avatar
          src={notification.sender?.avatar?.url}
          alt={notification.sender?.username}
          size="md"
        />

        <div>
          <p className="text-sm font-medium text-slate-900">
            {getNotificationText(notification)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : ""}
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => onDelete(notification._id)}
        className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete notification"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default NotificationItem;

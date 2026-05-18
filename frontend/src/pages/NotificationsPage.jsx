import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import NotificationItem from "../features/notifications/components/NotificationItem";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/notifications/notificationSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();

  const { notifications, loading, error, unreadCount } = useSelector(
    (state) => state.notifications,
  );

  useEffect(() => {
    const syncNotifications = async () => {
      const result = await dispatch(fetchNotifications());

      if (
        fetchNotifications.fulfilled.match(result) &&
        (result.payload || []).some((notification) => !notification.isRead)
      ) {
        dispatch(markAllNotificationsRead());
      }
    };

    syncNotifications();
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationRead(notificationId));
  };

  const handleDelete = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Loading notifications...
          </p>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && notifications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 p-8 text-center dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              No notifications yet
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Likes, comments, follows and mentions will appear here.
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;

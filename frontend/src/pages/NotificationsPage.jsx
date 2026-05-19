import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/Skeleton";
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
      <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
              className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-6">
            <ListSkeleton count={5} />
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            iconTone="blue"
            title="No notifications yet"
            description="Likes, comments, follows and mentions will appear here."
            className="mt-6"
            variant="subtle"
          />
        ) : null}

        <div className="mt-6 space-y-3">
          {!loading
            ? notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;

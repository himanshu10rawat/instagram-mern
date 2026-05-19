import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getNotificationsApi = async () => {
  const response = await api.get(API_ROUTES.notifications.list);
  return response.data.data;
};

export const markNotificationReadApi = async (notificationId) => {
  const response = await api.patch(
    API_ROUTES.notifications.markRead(notificationId),
  );
  return response.data.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await api.patch(API_ROUTES.notifications.markAllRead);
  return response.data.data;
};

export const deleteNotificationApi = async (notificationId) => {
  const response = await api.delete(
    API_ROUTES.notifications.delete(notificationId),
  );
  return response.data.data;
};

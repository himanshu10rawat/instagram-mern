import api from "../../lib/axios";

export const getNotificationsApi = async () => {
  const response = await api.get("/notifications");
  return response.data.data;
};

export const markNotificationReadApi = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data.data;
};

export const deleteNotificationApi = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data.data;
};

import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getMySessionsApi = async () => {
  const response = await api.get(API_ROUTES.sessions.list);

  return response.data.data;
};

export const revokeSessionApi = async (sessionId) => {
  const response = await api.patch(API_ROUTES.sessions.revoke(sessionId));

  return response.data.data;
};

export const revokeAllSessionsApi = async () => {
  const response = await api.patch(API_ROUTES.sessions.revokeAll);

  return response.data.data;
};

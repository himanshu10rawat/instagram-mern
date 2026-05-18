import api from "../../lib/axios";

export const getMySessionsApi = async () => {
  const response = await api.get("/sessions");

  return response.data.data;
};

export const revokeSessionApi = async (sessionId) => {
  const response = await api.patch(`/sessions/${sessionId}/revoke`);

  return response.data.data;
};

export const revokeAllSessionsApi = async () => {
  const response = await api.patch("/sessions/revoke-all");

  return response.data.data;
};

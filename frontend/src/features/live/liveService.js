import api from "../../lib/axios";

export const getActiveLivesApi = async () => {
  const response = await api.get("/live/active");

  return response.data.data;
};

export const startLiveApi = async (payload) => {
  const response = await api.post("/live/start", payload);

  return response.data.data;
};

export const joinLiveApi = async (liveId) => {
  const response = await api.post(`/live/${liveId}/join`);

  return response.data.data;
};

export const leaveLiveApi = async (liveId) => {
  const response = await api.post(`/live/${liveId}/leave`);

  return response.data.data;
};

export const endLiveApi = async (liveId) => {
  const response = await api.patch(`/live/${liveId}/end`);

  return response.data.data;
};

export const getAgoraRtcTokenApi = async ({ channelName, role, uid }) => {
  const response = await api.post("/agora/rtc-token", {
    channelName,
    role,
    uid,
  });

  return response.data.data;
};

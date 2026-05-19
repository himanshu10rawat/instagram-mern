import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

const createChannelName = () => {
  return `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getActiveLivesApi = async () => {
  const response = await api.get(API_ROUTES.live.active);

  return response.data.data;
};

export const startLiveApi = async (payload) => {
  const response = await api.post(API_ROUTES.live.start, {
    ...payload,
    channelName: payload?.channelName || createChannelName(),
  });

  return response.data.data;
};

export const joinLiveApi = async (liveId) => {
  const response = await api.post(API_ROUTES.live.join(liveId));

  return response.data.data;
};

export const leaveLiveApi = async (liveId) => {
  const response = await api.post(API_ROUTES.live.leave(liveId));

  return response.data.data;
};

export const endLiveApi = async (liveId) => {
  const response = await api.patch(API_ROUTES.live.end(liveId));

  return response.data.data;
};

export const getAgoraRtcTokenApi = async ({ channelName, role, uid }) => {
  const response = await api.post(API_ROUTES.agora.rtcToken, {
    channelName,
    role,
    uid,
  });

  return response.data.data;
};

import api from "../../lib/axios";

export const getReelsApi = async ({ page = 1, limit = 10 }) => {
  const response = await api.get(`/reels?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getSingleReelApi = async (reelId) => {
  const response = await api.get(`/reels/${reelId}`);
  return response.data.data;
};

export const likeReelApi = async (reelId) => {
  const response = await api.patch(`/reels/${reelId}/like`);
  return response.data.data;
};

export const saveReelApi = async (reelId) => {
  const response = await api.patch(`/reels/${reelId}/save`);
  return response.data.data;
};

export const commentReelApi = async ({ reelId, text }) => {
  const response = await api.post(`/reels/${reelId}/comments`, {
    text,
  });

  return response.data.data;
};

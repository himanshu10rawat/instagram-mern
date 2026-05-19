import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getReelsApi = async ({ page = 1, limit = 10 }) => {
  const response = await api.get(API_ROUTES.reels.feed, {
    params: { page, limit },
  });
  return response.data.data;
};

export const getSingleReelApi = async (reelId) => {
  const response = await api.get(API_ROUTES.reels.detail(reelId));
  return response.data.data;
};

export const likeReelApi = async (reelId, isLiked = false) => {
  const response = isLiked
    ? await api.delete(API_ROUTES.reels.like(reelId))
    : await api.post(API_ROUTES.reels.like(reelId));

  return response.data.data;
};

export const saveReelApi = async (reelId, isSaved = false) => {
  const response = isSaved
    ? await api.delete(API_ROUTES.reels.save(reelId))
    : await api.post(API_ROUTES.reels.save(reelId));

  return response.data.data;
};

export const commentReelApi = async ({ reelId, text }) => {
  const response = await api.post(API_ROUTES.reels.comments(reelId), {
    text,
  });

  return response.data.data;
};

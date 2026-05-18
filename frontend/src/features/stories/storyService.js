import api from "../../lib/axios";

export const getStoriesFeedApi = async () => {
  const response = await api.get("/stories");
  return response.data.data;
};

export const getSingleStoryApi = async (storyId) => {
  const response = await api.get(`/stories/${storyId}`);
  return response.data.data;
};

export const markStoryViewedApi = async (storyId) => {
  const response = await api.get(`/stories/${storyId}`);
  return response.data.data;
};

export const likeStoryApi = async (storyId, isLiked = false) => {
  const response = isLiked
    ? await api.delete(`/stories/${storyId}/like`)
    : await api.post(`/stories/${storyId}/like`);

  return response.data.data;
};

export const replyStoryApi = async ({ storyId, text }) => {
  const response = await api.post(`/stories/${storyId}/reply`, {
    text,
  });

  return response.data.data;
};

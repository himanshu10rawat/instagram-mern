import api from "../../lib/axios";

export const getStoriesFeedApi = async () => {
  const response = await api.get("/stories");
  return response.data.data;
};

export const viewStoryApi = async (storyId) => {
  const response = await api.get(`/stories/${storyId}`);
  return response.data.data;
};

export const likeStoryApi = async (storyId) => {
  const response = await api.post(`/stories/${storyId}/like`);
  return response.data.data;
};

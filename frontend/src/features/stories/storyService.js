import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getStoriesFeedApi = async () => {
  const response = await api.get(API_ROUTES.stories.feed);
  return response.data.data;
};

export const getSingleStoryApi = async (storyId) => {
  const response = await api.get(API_ROUTES.stories.detail(storyId));
  return response.data.data;
};

export const getUserStoriesApi = async (userId) => {
  const response = await api.get(API_ROUTES.stories.userStories(userId));
  return response.data.data;
};

export const getStoryEngagementApi = async (storyId) => {
  const response = await api.get(API_ROUTES.stories.viewers(storyId));
  return response.data.data;
};

export const markStoryViewedApi = async (storyId) => {
  const response = await api.get(API_ROUTES.stories.viewed(storyId));
  return response.data.data;
};

export const likeStoryApi = async (storyId, isLiked = false) => {
  const response = isLiked
    ? await api.delete(API_ROUTES.stories.like(storyId))
    : await api.post(API_ROUTES.stories.like(storyId));

  return response.data.data;
};

export const replyStoryApi = async ({ storyId, text }) => {
  const response = await api.post(API_ROUTES.stories.reply(storyId), {
    text,
  });

  return response.data.data;
};

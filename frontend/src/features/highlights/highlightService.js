import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getMyHighlightsApi = async () => {
  const response = await api.get(API_ROUTES.highlights.me);
  return response.data.data;
};

export const getUserHighlightsApi = async (userId) => {
  const response = await api.get(API_ROUTES.highlights.user(userId));
  return response.data.data;
};

export const createHighlightApi = async (payload) => {
  const response = await api.post(API_ROUTES.highlights.create, payload);
  return response.data.data;
};

export const updateHighlightApi = async ({ highlightId, title }) => {
  const response = await api.patch(API_ROUTES.highlights.update(highlightId), {
    title,
  });

  return response.data.data;
};

export const deleteHighlightApi = async (highlightId) => {
  const response = await api.delete(API_ROUTES.highlights.delete(highlightId));
  return response.data.data;
};

export const addStoryToHighlightApi = async ({ highlightId, storyId }) => {
  const response = await api.post(API_ROUTES.highlights.addStory(highlightId), {
    storyId,
  });

  return response.data.data;
};

export const removeStoryFromHighlightApi = async ({ highlightId, storyId }) => {
  const response = await api.delete(
    API_ROUTES.highlights.removeStory(highlightId),
    {
      data: {
        storyId,
      },
    },
  );

  return response.data.data;
};

export const getArchivedStoriesApi = async () => {
  const response = await api.get(API_ROUTES.stories.archive);
  return response.data.data;
};

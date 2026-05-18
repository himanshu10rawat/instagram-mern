import api from "../../lib/axios";

export const getMyHighlightsApi = async () => {
  const response = await api.get("/highlights/me");
  return response.data.data;
};

export const getUserHighlightsApi = async (userId) => {
  const response = await api.get(`/highlights/user/${userId}`);
  return response.data.data;
};

export const createHighlightApi = async (payload) => {
  const response = await api.post("/highlights", payload);
  return response.data.data;
};

export const updateHighlightApi = async ({ highlightId, title }) => {
  const response = await api.patch(`/highlights/${highlightId}`, {
    title,
  });

  return response.data.data;
};

export const deleteHighlightApi = async (highlightId) => {
  const response = await api.delete(`/highlights/${highlightId}`);
  return response.data.data;
};

export const addStoryToHighlightApi = async ({ highlightId, storyId }) => {
  const response = await api.post(`/highlights/${highlightId}/stories`, {
    storyId,
  });

  return response.data.data;
};

export const removeStoryFromHighlightApi = async ({ highlightId, storyId }) => {
  const response = await api.delete(`/highlights/${highlightId}/stories`, {
    data: {
      storyId,
    },
  });

  return response.data.data;
};

export const getArchivedStoriesApi = async () => {
  const response = await api.get("/stories/archive");
  return response.data.data;
};

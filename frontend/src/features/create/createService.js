import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const createPostApi = async (formData) => {
  const response = await api.post(API_ROUTES.posts.create, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const createReelApi = async (formData) => {
  const response = await api.post(API_ROUTES.reels.create, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const createStoryApi = async (formData) => {
  const response = await api.post(API_ROUTES.stories.create, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const createPostApi = async (formData) => {
  const response = await api.post(API_ROUTES.posts.create, formData);

  return response.data.data;
};

export const createReelApi = async (formData) => {
  const response = await api.post(API_ROUTES.reels.create, formData);

  return response.data.data;
};

export const createStoryApi = async (formData) => {
  const response = await api.post(API_ROUTES.stories.create, formData);

  return response.data.data;
};

import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getMyProfileApi = async () => {
  const response = await api.get(API_ROUTES.profile.me);
  return response.data.data;
};

export const getUserProfileApi = async (username) => {
  const response = await api.get(API_ROUTES.profile.user(username));
  return response.data.data;
};

export const updateProfileApi = async (payload) => {
  const response = await api.patch(API_ROUTES.profile.update, payload);
  return response.data.data;
};

export const updateAvatarApi = async (formData) => {
  const response = await api.patch(API_ROUTES.profile.avatar, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updateCoverApi = async (formData) => {
  const response = await api.patch(API_ROUTES.profile.cover, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updatePrivacySettingsApi = async (payload) => {
  const { privacySettings, ...restPayload } = payload || {};
  const normalizedPayload = {
    ...restPayload,
    ...(privacySettings || {}),
  };

  const response = await api.patch(
    API_ROUTES.profile.privacy,
    normalizedPayload,
  );
  return response.data.data;
};

export const removeAccountApi = async (password) => {
  const response = await api.delete(API_ROUTES.profile.deactivate, {
    data: { password },
  });

  return response.data.data;
};

export const getUserPostsApi = async (userId) => {
  const response = await api.get(API_ROUTES.posts.userPosts(userId));
  return response.data.data;
};

export const getUserReelsApi = async (userId) => {
  const response = await api.get(API_ROUTES.reels.userReels(userId));
  return response.data.data;
};

export const getMySavedProfilePostsApi = async () => {
  const response = await api.get(API_ROUTES.posts.saved);
  return response.data.data;
};

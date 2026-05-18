import api from "../../lib/axios";

export const getMyProfileApi = async () => {
  const response = await api.get("/profile/me");
  return response.data.data;
};

export const getUserProfileApi = async (username) => {
  const response = await api.get(`/profile/${username}`);
  return response.data.data;
};

export const updateProfileApi = async (payload) => {
  const response = await api.patch("/profile/me", payload);
  return response.data.data;
};

export const updateAvatarApi = async (formData) => {
  const response = await api.patch("/profile/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updateCoverApi = async (formData) => {
  const response = await api.patch("/profile/me/cover", formData, {
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

  const response = await api.patch("/profile/me/privacy", normalizedPayload);
  return response.data.data;
};

export const removeAccountApi = async (password) => {
  const response = await api.delete("/profile/me", {
    data: { password },
  });

  return response.data.data;
};

export const getUserPostsApi = async (userId) => {
  const response = await api.get(`/posts/user/${userId}`);
  return response.data.data;
};

export const getUserReelsApi = async (userId) => {
  const response = await api.get(`/reels/user/${userId}`);
  return response.data.data;
};

export const getMySavedProfilePostsApi = async () => {
  const response = await api.get("/posts/saved");
  return response.data.data;
};

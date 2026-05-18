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
  const response = await api.patch("/profile/edit", payload);
  return response.data.data;
};

export const updateAvatarApi = async (formData) => {
  const response = await api.patch("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const updateCoverApi = async (formData) => {
  const response = await api.patch("/profile/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

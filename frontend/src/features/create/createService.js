import api from "../../lib/axios";

export const createPostApi = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const createStoryApi = async (formData) => {
  const response = await api.post("/stories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const createReelApi = async (formData) => {
  const response = await api.post("/reels", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

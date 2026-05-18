import api from "../../lib/axios";

export const searchUsersApi = async (query) => {
  const response = await api.get(
    `/explore/search/users?query=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const searchPostsApi = async (query) => {
  const response = await api.get(
    `/explore/search/posts?query=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const searchReelsApi = async (query) => {
  const response = await api.get(
    `/explore/search/reels?query=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const searchHashtagsApi = async (query) => {
  const response = await api.get(
    `/hashtags/search?query=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const getTrendingContentApi = async () => {
  const response = await api.get("/explore/trending");

  return response.data.data;
};

import api from "../../lib/axios";

export const searchUsersApi = async (query) => {
  const response = await api.get(
    `/explore/search/users?q=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const searchPostsApi = async (query) => {
  const response = await api.get(
    `/explore/search/posts?q=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const searchReelsApi = async (query) => {
  const response = await api.get(
    `/explore/search/reels?q=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const searchHashtagsApi = async (query) => {
  const response = await api.get(
    `/explore/search/hashtags?q=${encodeURIComponent(query)}`,
  );

  return response.data.data;
};

export const getTrendingContentApi = async () => {
  const [feedResponse, reelsResponse] = await Promise.all([
    api.get("/explore/feed"),
    api.get("/explore/trending/reels"),
  ]);

  return {
    posts: feedResponse.data.data?.posts || [],
    reels: reelsResponse.data.data || [],
  };
};

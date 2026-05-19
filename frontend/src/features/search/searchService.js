import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const searchUsersApi = async (query) => {
  const response = await api.get(API_ROUTES.search.users, {
    params: { q: query },
  });

  return response.data.data;
};

export const searchPostsApi = async (query) => {
  const response = await api.get(API_ROUTES.search.posts, {
    params: { q: query },
  });

  return response.data.data;
};

export const searchReelsApi = async (query) => {
  const response = await api.get(API_ROUTES.search.reels, {
    params: { q: query },
  });

  return response.data.data;
};

export const searchHashtagsApi = async (query) => {
  const response = await api.get(API_ROUTES.search.hashtags, {
    params: { q: query },
  });

  return response.data.data;
};

export const getTrendingContentApi = async () => {
  const [feedResponse, reelsResponse] = await Promise.all([
    api.get(API_ROUTES.search.explore),
    api.get(API_ROUTES.search.trendingReels),
  ]);

  return {
    posts: feedResponse.data.data?.posts || [],
    reels: reelsResponse.data.data || [],
  };
};

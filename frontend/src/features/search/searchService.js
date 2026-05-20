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

export const getSearchHistoryApi = async () => {
  const response = await api.get(API_ROUTES.searchHistory.list);
  return response.data.data;
};

export const saveSearchHistoryApi = async (search) => {
  const payload =
    typeof search === "string"
      ? {
          searchType: "text",
          query: search,
        }
      : search;

  const response = await api.post(API_ROUTES.searchHistory.save, payload);

  return response.data.data;
};

export const clearSearchHistoryApi = async () => {
  const response = await api.delete(API_ROUTES.searchHistory.clear);
  return response.data.data;
};

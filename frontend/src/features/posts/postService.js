import api from "../../lib/axios";

export const getFeedPostApi = async ({ page = 1, limit = 10 }) => {
  const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const likePostApi = async (postId, isLiked = false) => {
  const response = isLiked
    ? await api.delete(`/posts/${postId}/like`)
    : await api.post(`/posts/${postId}/like`);

  return response.data.data;
};

export const savePostApi = async (postId, isSaved = false) => {
  const response = isSaved
    ? await api.delete(`/posts/${postId}/save`)
    : await api.post(`/posts/${postId}/save`);

  return response.data.data;
};

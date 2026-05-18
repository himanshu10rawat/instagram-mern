import api from "../../lib/axios";

export const getFeedPostsApi = async ({ page = 1, limit = 10 }) => {
  const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getSinglePostApi = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data.data;
};

export const getSavedPostsApi = async () => {
  const response = await api.get("/posts/saved");
  return response.data.data;
};

export const getArchivedPostsApi = async () => {
  const response = await api.get("/posts/archived");
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

export const commentPostApi = async ({ postId, text }) => {
  const response = await api.post(`/posts/${postId}/comments`, {
    text,
  });

  return response.data.data;
};

export const archivePostApi = async (postId) => {
  const response = await api.patch(`/posts/${postId}/archive`);
  return response.data.data;
};

export const unarchivePostApi = async (postId) => {
  const response = await api.patch(`/posts/${postId}/unarchive`);
  return response.data.data;
};

export const updatePostCaptionApi = async ({ postId, caption }) => {
  const response = await api.patch(`/posts/${postId}`, {
    caption,
  });

  return response.data.data;
};

export const deletePostApi = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data.data;
};

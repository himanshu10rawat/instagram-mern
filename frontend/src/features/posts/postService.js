import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getFeedPostsApi = async ({ page = 1, limit = 10 }) => {
  const response = await api.get(API_ROUTES.posts.feed, {
    params: { page, limit },
  });
  return response.data.data;
};

export const getSinglePostApi = async (postId) => {
  const response = await api.get(API_ROUTES.posts.detail(postId));
  return response.data.data;
};

export const getSavedPostsApi = async () => {
  const response = await api.get(API_ROUTES.posts.saved);
  return response.data.data;
};

export const getArchivedPostsApi = async () => {
  const response = await api.get(API_ROUTES.posts.archive);
  return response.data.data;
};

export const likePostApi = async (postId, isLiked = false) => {
  const response = isLiked
    ? await api.delete(API_ROUTES.posts.like(postId))
    : await api.post(API_ROUTES.posts.like(postId));

  return response.data.data;
};

export const savePostApi = async (postId, isSaved = false) => {
  const response = isSaved
    ? await api.delete(API_ROUTES.posts.save(postId))
    : await api.post(API_ROUTES.posts.save(postId));

  return response.data.data;
};

export const commentPostApi = async ({ postId, text }) => {
  const response = await api.post(API_ROUTES.posts.comments(postId), {
    text,
  });

  return response.data.data;
};

export const archivePostApi = async (postId) => {
  const response = await api.patch(API_ROUTES.posts.archivePost(postId));
  return response.data.data;
};

export const unarchivePostApi = async (postId) => {
  const response = await api.patch(API_ROUTES.posts.unarchivePost(postId));
  return response.data.data;
};

export const updatePostCaptionApi = async ({ postId, caption }) => {
  const response = await api.patch(API_ROUTES.posts.updateCaption(postId), {
    caption,
  });

  return response.data.data;
};

export const deletePostApi = async (postId) => {
  const response = await api.delete(API_ROUTES.posts.delete(postId));
  return response.data.data;
};

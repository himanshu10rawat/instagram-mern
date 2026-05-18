import api from "../../lib/axios";

export const getCollectionsApi = async () => {
  const response = await api.get("/collections");
  return response.data.data;
};

export const getCollectionByIdApi = async (collectionId) => {
  const response = await api.get(`/collections/${collectionId}`);
  return response.data.data;
};

export const createCollectionApi = async (payload) => {
  const response = await api.post("/collections", payload);
  return response.data.data;
};

export const updateCollectionApi = async ({ collectionId, payload }) => {
  const response = await api.patch(`/collections/${collectionId}`, payload);
  return response.data.data;
};

export const deleteCollectionApi = async (collectionId) => {
  const response = await api.delete(`/collections/${collectionId}`);
  return response.data.data;
};

export const addPostToCollectionApi = async ({ collectionId, postId }) => {
  const response = await api.post(
    `/collections/${collectionId}/posts/${postId}`,
  );
  return response.data.data;
};

export const removePostFromCollectionApi = async ({ collectionId, postId }) => {
  const response = await api.delete(
    `/collections/${collectionId}/posts/${postId}`,
  );
  return response.data.data;
};

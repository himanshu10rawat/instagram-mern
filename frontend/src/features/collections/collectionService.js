import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getCollectionsApi = async () => {
  const response = await api.get(API_ROUTES.collections.list);
  return response.data.data;
};

export const getCollectionByIdApi = async (collectionId) => {
  const response = await api.get(API_ROUTES.collections.detail(collectionId));
  return response.data.data;
};

export const createCollectionApi = async (payload) => {
  const response = await api.post(API_ROUTES.collections.create, payload);
  return response.data.data;
};

export const updateCollectionApi = async ({ collectionId, payload }) => {
  const response = await api.patch(
    API_ROUTES.collections.update(collectionId),
    payload,
  );
  return response.data.data;
};

export const deleteCollectionApi = async (collectionId) => {
  const response = await api.delete(API_ROUTES.collections.delete(collectionId));
  return response.data.data;
};

export const addPostToCollectionApi = async ({ collectionId, postId }) => {
  const response = await api.post(
    API_ROUTES.collections.addPost({ collectionId }),
    { postId },
  );
  return response.data.data;
};

export const removePostFromCollectionApi = async ({ collectionId, postId }) => {
  const response = await api.delete(
    API_ROUTES.collections.removePost({ collectionId }),
    {
      data: {
        postId,
      },
    },
  );
  return response.data.data;
};

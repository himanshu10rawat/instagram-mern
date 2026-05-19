import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const followUserApi = async (userId) => {
  const response = await api.post(API_ROUTES.follow.follow(userId));
  return response.data.data;
};

export const unfollowUserApi = async (userId) => {
  const response = await api.delete(API_ROUTES.follow.unfollow(userId));
  return response.data.data;
};

export const getFollowersApi = async (userId) => {
  const response = await api.get(API_ROUTES.follow.followers(userId));
  return response.data.data;
};

export const getFollowingApi = async (userId) => {
  const response = await api.get(API_ROUTES.follow.following(userId));
  return response.data.data;
};

export const getFollowRequestsApi = async () => {
  const response = await api.get(API_ROUTES.follow.requests);
  return response.data.data;
};

export const acceptFollowRequestApi = async (requestId) => {
  const response = await api.patch(API_ROUTES.follow.accept(requestId));
  return response.data.data;
};

export const rejectFollowRequestApi = async (requestId) => {
  const response = await api.patch(API_ROUTES.follow.reject(requestId));
  return response.data.data;
};

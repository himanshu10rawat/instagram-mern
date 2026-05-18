import api from "../../lib/axios";

export const followUserApi = async (userId) => {
  const response = await api.post(`/follow/${userId}`);
  return response.data.data;
};

export const unfollowUserApi = async (userId) => {
  const response = await api.delete(`/follow/${userId}`);
  return response.data.data;
};

export const getFollowersApi = async (userId) => {
  const response = await api.get(`/follow/${userId}/followers`);
  return response.data.data;
};

export const getFollowingApi = async (userId) => {
  const response = await api.get(`/follow/${userId}/following`);
  return response.data.data;
};

export const getFollowRequestsApi = async () => {
  const response = await api.get("/follow/requests/received");
  return response.data.data;
};

export const acceptFollowRequestApi = async (requestId) => {
  const response = await api.patch(`/follow/request/${requestId}/accept`);
  return response.data.data;
};

export const rejectFollowRequestApi = async (requestId) => {
  const response = await api.patch(`/follow/request/${requestId}/reject`);
  return response.data.data;
};

import api from "../../lib/axios";

export const followUserApi = async (userId) => {
  const response = await api.post(`/follow/${userId}`);
  return response.data.data;
};

export const unfollowUserApi = async (userId) => {
  const response = await api.delete(`/follow/${userId}`);
  return response.data.data;
};

export const getFollowRequestsApi = async () => {
  const response = await api.get("/follow/requests");
  return response.data.data;
};

export const acceptFollowRequestApi = async (requestId) => {
  const response = await api.patch(`/follow/requests/${requestId}/accept`);
  return response.data.data;
};

export const rejectFollowRequestApi = async (requestId) => {
  const response = await api.patch(`/follow/requests/${requestId}/reject`);
  return response.data.data;
};

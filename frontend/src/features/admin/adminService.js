import api from "../../lib/axios";

export const getAdminDashboardApi = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data.data;
};

export const getAdminUsersApi = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data.data;
};

export const blockAdminUserApi = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/block`);
  return response.data.data;
};

export const unblockAdminUserApi = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/unblock`);
  return response.data.data;
};

export const getAdminReportsApi = async (params = {}) => {
  const response = await api.get("/admin/reports", {
    params,
  });

  return response.data.data;
};

export const resolveReportApi = async (reportId) => {
  const response = await api.patch(`/admin/reports/${reportId}/resolve`);
  return response.data.data;
};

export const deleteReportApi = async (reportId) => {
  const response = await api.delete(`/admin/reports/${reportId}`);
  return response.data.data;
};

export const deleteAdminPostApi = async (postId) => {
  const response = await api.delete(`/admin/posts/${postId}`);
  return response.data.data;
};

export const deleteAdminReelApi = async (reelId) => {
  const response = await api.delete(`/admin/reels/${reelId}`);
  return response.data.data;
};

export const deleteAdminCommentApi = async (commentId) => {
  const response = await api.delete(`/admin/comments/${commentId}`);
  return response.data.data;
};

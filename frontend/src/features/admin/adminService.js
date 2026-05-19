import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getAdminDashboardApi = async () => {
  const response = await api.get(API_ROUTES.admin.dashboard);
  return response.data.data;
};

export const getAdminUsersApi = async (params = {}) => {
  const response = await api.get(API_ROUTES.admin.users, {
    params,
  });

  return response.data.data;
};

export const blockAdminUserApi = async (userId) => {
  const response = await api.patch(API_ROUTES.admin.blockUser(userId));
  return response.data.data;
};

export const unblockAdminUserApi = async (userId) => {
  const response = await api.patch(API_ROUTES.admin.unblockUser(userId));
  return response.data.data;
};

export const getAdminReportsApi = async (params = {}) => {
  const response = await api.get(API_ROUTES.admin.reports, {
    params,
  });

  return response.data.data;
};

export const resolveReportApi = async (reportId) => {
  const response = await api.patch(API_ROUTES.admin.resolveReport(reportId), {
    status: "resolved",
  });
  return response.data.data;
};

export const deleteReportApi = async (reportId) => {
  const response = await api.delete(API_ROUTES.admin.deleteReport(reportId));
  return response.data.data;
};

export const deleteAdminPostApi = async (postId) => {
  const response = await api.delete(API_ROUTES.admin.deletePost(postId));
  return response.data.data;
};

export const deleteAdminReelApi = async (reelId) => {
  const response = await api.delete(API_ROUTES.admin.deleteReel(reelId));
  return response.data.data;
};

export const deleteAdminCommentApi = async (commentId) => {
  const response = await api.delete(API_ROUTES.admin.deleteComment(commentId));
  return response.data.data;
};

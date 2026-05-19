import api from "../../lib/axios";

export const getCreatorDashboardStatsApi = async (days = 30) => {
  const response = await api.get("/analytics/dashboard", {
    params: { days },
  });

  return response.data.data;
};

export const getProfileVisitsAnalyticsApi = async (days = 30) => {
  const response = await api.get("/analytics/profile-visits", {
    params: { days },
  });

  return response.data.data;
};

export const getPostAnalyticsApi = async (postId) => {
  const response = await api.get(`/analytics/posts/${postId}`);

  return response.data.data;
};

export const getReelAnalyticsApi = async (reelId) => {
  const response = await api.get(`/analytics/reels/${reelId}`);

  return response.data.data;
};

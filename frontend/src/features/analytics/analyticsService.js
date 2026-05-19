import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getCreatorDashboardStatsApi = async (days = 30) => {
  const response = await api.get(API_ROUTES.analytics.dashboard, {
    params: { days },
  });

  return response.data.data;
};

export const getProfileVisitsAnalyticsApi = async (days = 30) => {
  const response = await api.get(API_ROUTES.analytics.profileVisits, {
    params: { days },
  });

  return response.data.data;
};

export const getPostAnalyticsApi = async (postId) => {
  const response = await api.get(API_ROUTES.analytics.post(postId));

  return response.data.data;
};

export const getReelAnalyticsApi = async (reelId) => {
  const response = await api.get(API_ROUTES.analytics.reel(reelId));

  return response.data.data;
};

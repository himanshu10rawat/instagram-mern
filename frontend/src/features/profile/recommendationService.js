import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getSuggestedUsersApi = async () => {
  const response = await api.get(API_ROUTES.recommendations.users);

  return response.data.data;
};

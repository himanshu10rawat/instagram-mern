import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getCloseFriendsApi = async () => {
  const response = await api.get(API_ROUTES.closeFriends.list);

  return response.data.data;
};

export const addCloseFriendApi = async (userId) => {
  const response = await api.post(API_ROUTES.closeFriends.add(userId));

  return response.data.data;
};

export const removeCloseFriendApi = async (userId) => {
  const response = await api.delete(API_ROUTES.closeFriends.remove(userId));

  return response.data.data;
};

import api from "../../lib/axios";

export const getSuggestedUsersApi = async () => {
  const response = await api.get("/recommendations/users");
  return response.data.data;
};

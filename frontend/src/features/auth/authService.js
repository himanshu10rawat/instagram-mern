import api from "../../lib/axios";

export const loginUserApi = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data.data;
};

export const registerUserApi = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

export const logoutUserApi = async () => {
  const response = await api.post("/auth/logout");
  return response.data.data;
};

export const changePasswordApi = async (payload) => {
  const response = await api.post("/auth/change-password", payload);
  return response.data.data;
};

export const forgotPasswordApi = async (payload) => {
  const response = await api.post("/auth/forgot-password", payload);
  return response.data.data;
};

export const resetPasswordApi = async ({ token, password }) => {
  const response = await api.post(`/auth/reset-password/${token}`, {
    password,
  });

  return response.data.data;
};

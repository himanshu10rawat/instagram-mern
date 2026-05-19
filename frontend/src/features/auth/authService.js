import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const loginUserApi = async (payload) => {
  const response = await api.post(API_ROUTES.auth.login, payload);
  return response.data.data;
};

export const registerUserApi = async (payload) => {
  const response = await api.post(API_ROUTES.auth.register, payload);
  return response.data.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get(API_ROUTES.auth.me);
  return response.data.data;
};

export const logoutUserApi = async () => {
  const response = await api.post(API_ROUTES.auth.logout);
  return response.data.data;
};

export const changePasswordApi = async (payload) => {
  const response = await api.post(API_ROUTES.auth.changePassword, payload);
  return response.data.data;
};

export const forgotPasswordApi = async (payload) => {
  const response = await api.post(API_ROUTES.auth.forgotPassword, payload);
  return response.data.data;
};

export const resetPasswordApi = async ({ token, password }) => {
  const response = await api.post(API_ROUTES.auth.resetPassword(token), {
    password,
  });

  return response.data.data;
};

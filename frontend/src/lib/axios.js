import axios from "axios";

import { env } from "../config/env";
import { API_ROUTES } from "../constants/apiRoutes";

const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !requestUrl.includes(API_ROUTES.auth.login) &&
      !requestUrl.includes(API_ROUTES.auth.register) &&
      !requestUrl.includes(API_ROUTES.auth.refreshToken)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (
          !refreshToken ||
          refreshToken === "undefined" ||
          refreshToken === "null"
        ) {
          throw new Error("No refresh token available");
        }

        const response = await api.post(API_ROUTES.auth.refreshToken, {
          refreshToken,
        });

        const newAccessToken = response?.data?.data?.accessToken;
        const newRefreshToken = response?.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

import axios from "axios";

import { env } from "../config/env";

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
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/register") &&
      !requestUrl.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshPayload =
          refreshToken && refreshToken !== "undefined" && refreshToken !== "null"
            ? { refreshToken }
            : undefined;

        const response = await api.post("/auth/refresh-token", refreshPayload);

        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

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

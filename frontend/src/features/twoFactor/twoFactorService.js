import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const setupTwoFactorApi = async () => {
  const response = await api.post(API_ROUTES.twoFactor.setup);

  return response.data.data;
};

export const enableTwoFactorApi = async (token) => {
  const response = await api.post(API_ROUTES.twoFactor.enable, {
    token,
  });

  return response.data.data;
};

export const disableTwoFactorApi = async (token) => {
  const response = await api.post(API_ROUTES.twoFactor.disable, {
    token,
  });

  return response.data.data;
};

export const regenerateBackupCodesApi = async (token) => {
  const response = await api.post(API_ROUTES.twoFactor.regenerateBackupCodes, {
    token,
  });

  return response.data.data;
};

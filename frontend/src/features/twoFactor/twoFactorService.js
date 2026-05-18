import api from "../../lib/axios";

export const setupTwoFactorApi = async () => {
  const response = await api.post("/2fa/setup");

  return response.data.data;
};

export const enableTwoFactorApi = async (token) => {
  const response = await api.post("/2fa/enable", {
    token,
  });

  return response.data.data;
};

export const disableTwoFactorApi = async (token) => {
  const response = await api.post("/2fa/disable", {
    token,
  });

  return response.data.data;
};

export const regenerateBackupCodesApi = async (token) => {
  const response = await api.post("/2fa/backup-codes/regenerate", {
    token,
  });

  return response.data.data;
};

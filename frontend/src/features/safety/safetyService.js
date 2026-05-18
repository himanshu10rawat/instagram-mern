import api from "../../lib/axios";

export const getBlockedUsersApi = async () => {
  const response = await api.get("/safety/blocked-users");

  return response.data.data;
};

export const getMutedUsersApi = async () => {
  const response = await api.get("/safety/muted-users");

  return response.data.data;
};

export const blockUserApi = async (userId) => {
  const response = await api.post(`/safety/block/${userId}`);

  return response.data.data;
};

export const unblockUserApi = async (userId) => {
  const response = await api.delete(`/safety/block/${userId}`);

  return response.data.data;
};

export const muteUserApi = async (userId) => {
  const response = await api.post(`/safety/mute/${userId}`);

  return response.data.data;
};

export const unmuteUserApi = async (userId) => {
  const response = await api.delete(`/safety/mute/${userId}`);

  return response.data.data;
};

export const reportUserApi = async ({ userId, reason, description }) => {
  const response = await api.post(`/safety/report/user/${userId}`, {
    reason,
    description,
  });

  return response.data.data;
};

export const reportPostApi = async ({ postId, reason, description }) => {
  const response = await api.post(`/safety/report/post/${postId}`, {
    reason,
    description,
  });

  return response.data.data;
};

export const reportReelApi = async ({ reelId, reason, description }) => {
  const response = await api.post(`/safety/report/reel/${reelId}`, {
    reason,
    description,
  });

  return response.data.data;
};

export const reportCommentApi = async ({ commentId, reason, description }) => {
  const response = await api.post(`/safety/report/comment/${commentId}`, {
    reason,
    description,
  });

  return response.data.data;
};

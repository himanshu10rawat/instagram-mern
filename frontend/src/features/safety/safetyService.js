import api from "../../lib/axios";
import { API_ROUTES } from "../../constants/apiRoutes";

export const getBlockedUsersApi = async () => {
  const response = await api.get(API_ROUTES.safety.blockedUsers);

  return response.data.data;
};

export const getMutedUsersApi = async () => {
  const response = await api.get(API_ROUTES.safety.mutedUsers);

  return response.data.data;
};

export const blockUserApi = async (userId) => {
  const response = await api.post(API_ROUTES.safety.block(userId));

  return response.data.data;
};

export const unblockUserApi = async (userId) => {
  const response = await api.delete(API_ROUTES.safety.unblock(userId));

  return response.data.data;
};

export const muteUserApi = async (userId) => {
  const response = await api.post(API_ROUTES.safety.mute(userId));

  return response.data.data;
};

export const unmuteUserApi = async (userId) => {
  const response = await api.delete(API_ROUTES.safety.unmute(userId));

  return response.data.data;
};

export const reportUserApi = async ({ userId, reason, description }) => {
  const response = await api.post(API_ROUTES.safety.reportUser(userId), {
    reason,
    description,
  });

  return response.data.data;
};

export const reportPostApi = async ({ postId, reason, description }) => {
  const response = await api.post(API_ROUTES.safety.reportPost(postId), {
    reason,
    description,
  });

  return response.data.data;
};

export const reportReelApi = async ({ reelId, reason, description }) => {
  const response = await api.post(API_ROUTES.safety.reportReel(reelId), {
    reason,
    description,
  });

  return response.data.data;
};

export const reportCommentApi = async ({ commentId, reason, description }) => {
  const response = await api.post(API_ROUTES.safety.reportComment(commentId), {
    reason,
    description,
  });

  return response.data.data;
};

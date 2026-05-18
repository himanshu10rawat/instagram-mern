import api from "../../lib/axios";

export const getConversationsApi = async () => {
  const response = await api.get("/messages/conversations");
  return response.data.data;
};

export const getMessagesApi = async ({
  conversationId,
  page = 1,
  limit = 30,
}) => {
  const response = await api.get(
    `/messages/${conversationId}?page=${page}&limit=${limit}`,
  );

  return response.data.data;
};

export const sendMessageApi = async ({ receiverId, text, replyTo, file }) => {
  if (file) {
    const formData = new FormData();

    if (text) formData.append("text", text);
    if (replyTo) formData.append("replyTo", replyTo);

    formData.append("media", file);

    const response = await api.post(`/messages/${receiverId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  const response = await api.post(`/messages/${receiverId}`, {
    text,
    replyTo,
  });

  return response.data.data;
};

export const markConversationSeenApi = async (conversationId) => {
  const response = await api.patch(`/messages/${conversationId}/seen`);
  return response.data.data;
};

export const reactMessageApi = async ({ messageId, emoji }) => {
  const response = await api.patch(`/messages/${messageId}/react`, {
    emoji,
  });

  return response.data.data;
};

export const editMessageApi = async ({ messageId, text }) => {
  const response = await api.patch(`/messages/${messageId}/edit`, {
    text,
  });

  return response.data.data;
};

export const deleteMessageForMeApi = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}/me`);
  return response.data.data;
};

export const deleteMessageForEveryoneApi = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}/everyone`);
  return response.data.data;
};

export const getMessageRequestsApi = async () => {
  const response = await api.get("/messages/requests");
  return response.data.data;
};

export const acceptMessageRequestApi = async (conversationId) => {
  const response = await api.patch(
    `/messages/requests/${conversationId}/accept`,
  );
  return response.data.data;
};

export const rejectMessageRequestApi = async (conversationId) => {
  const response = await api.patch(
    `/messages/requests/${conversationId}/reject`,
  );
  return response.data.data;
};

export const createOrGetConversationApi = async (receiverId) => {
  const response = await api.post(`/messages/conversations/${receiverId}`);
  return response.data.data;
};

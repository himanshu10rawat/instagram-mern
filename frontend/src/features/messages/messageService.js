import api from "../../lib/axios";
import { API_ROUTES, FORM_DATA_FIELDS } from "../../constants/apiRoutes";

export const getConversationsApi = async () => {
  const response = await api.get(API_ROUTES.messages.conversations);
  return response.data.data;
};

export const getMessagesApi = async ({
  conversationId,
  page = 1,
  limit = 30,
}) => {
  const response = await api.get(API_ROUTES.messages.messages(conversationId), {
    params: { page, limit },
  });

  return response.data.data;
};

export const sendMessageApi = async ({ receiverId, text, replyTo, file }) => {
  if (file) {
    const formData = new FormData();

    if (text) formData.append("text", text);
    if (replyTo) formData.append("replyTo", replyTo);

    formData.append(FORM_DATA_FIELDS.message.media, file);

    const response = await api.post(
      API_ROUTES.messages.send(receiverId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  }

  const response = await api.post(API_ROUTES.messages.send(receiverId), {
    text,
    replyTo,
  });

  return response.data.data;
};

export const markConversationSeenApi = async (conversationId) => {
  const response = await api.patch(API_ROUTES.messages.seen(conversationId));
  return response.data.data;
};

export const reactMessageApi = async ({ messageId, emoji }) => {
  const response = await api.patch(API_ROUTES.messages.react(messageId), {
    emoji,
  });

  return response.data.data;
};

export const removeMessageReactionApi = async (messageId) => {
  const response = await api.delete(API_ROUTES.messages.removeReaction(messageId));

  return response.data.data;
};

export const editMessageApi = async ({ messageId, text }) => {
  const response = await api.patch(API_ROUTES.messages.edit(messageId), {
    text,
  });

  return response.data.data;
};

export const deleteMessageForMeApi = async (messageId) => {
  const response = await api.delete(API_ROUTES.messages.deleteForMe(messageId));
  return response.data.data;
};

export const deleteMessageForEveryoneApi = async (messageId) => {
  const response = await api.delete(
    API_ROUTES.messages.deleteForEveryone(messageId),
  );
  return response.data.data;
};

export const getMessageRequestsApi = async () => {
  const response = await api.get(API_ROUTES.messages.requests);
  return response.data.data;
};

export const acceptMessageRequestApi = async (conversationId) => {
  const response = await api.patch(
    API_ROUTES.messages.acceptRequest(conversationId),
  );
  return response.data.data;
};

export const rejectMessageRequestApi = async (conversationId) => {
  const response = await api.patch(
    API_ROUTES.messages.rejectRequest(conversationId),
  );
  return response.data.data;
};

export const createOrGetConversationApi = async (receiverId) => {
  const response = await api.post(
    API_ROUTES.messages.createConversation(receiverId),
  );
  return response.data.data;
};

export const shareToMessageApi = async ({
  receiverId,
  postId,
  reelId,
  storyId,
  profileId,
  text,
}) => {
  const response = await api.post(API_ROUTES.share.toUser, {
    receiverId,
    postId,
    reelId,
    storyId,
    profileId,
    text,
  });

  return response.data.data;
};

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  acceptMessageRequestApi,
  createOrGetConversationApi,
  editMessageApi,
  getConversationsApi,
  getMessageRequestsApi,
  getMessagesApi,
  markConversationSeenApi,
  reactMessageApi,
  rejectMessageRequestApi,
  removeMessageReactionApi,
  sendMessageApi,
  shareToMessageApi,
} from "./messageService";

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      return await getConversationsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch conversations",
      );
    }
  },
  {
    condition: (_, { getState }) => !getState().messages.loading,
  },
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ conversationId, page = 1, limit = 30 }, { rejectWithValue }) => {
    try {
      return await getMessagesApi({ conversationId, page, limit });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages",
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (payload, { rejectWithValue }) => {
    try {
      return await sendMessageApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message",
      );
    }
  },
);

export const markConversationSeen = createAsyncThunk(
  "messages/markConversationSeen",
  async (conversationId, { rejectWithValue }) => {
    try {
      await markConversationSeenApi(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark seen",
      );
    }
  },
);

export const reactMessage = createAsyncThunk(
  "messages/reactMessage",
  async (payload, { rejectWithValue }) => {
    try {
      return await reactMessageApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to react message",
      );
    }
  },
);

export const removeMessageReaction = createAsyncThunk(
  "messages/removeMessageReaction",
  async (messageId, { rejectWithValue }) => {
    try {
      return await removeMessageReactionApi(messageId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove reaction",
      );
    }
  },
);

export const editMessage = createAsyncThunk(
  "messages/editMessage",
  async (payload, { rejectWithValue }) => {
    try {
      return await editMessageApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to edit message",
      );
    }
  },
);

export const fetchMessageRequests = createAsyncThunk(
  "messages/fetchMessageRequests",
  async (_, { rejectWithValue }) => {
    try {
      return await getMessageRequestsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch requests",
      );
    }
  },
  {
    condition: (_, { getState }) => !getState().messages.requestsLoading,
  },
);

export const acceptMessageRequest = createAsyncThunk(
  "messages/acceptMessageRequest",
  async (conversationId, { rejectWithValue }) => {
    try {
      return await acceptMessageRequestApi(conversationId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to accept request",
      );
    }
  },
);

export const rejectMessageRequest = createAsyncThunk(
  "messages/rejectMessageRequest",
  async (conversationId, { rejectWithValue }) => {
    try {
      await rejectMessageRequestApi(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject request",
      );
    }
  },
);

export const startConversation = createAsyncThunk(
  "messages/startConversation",
  async (receiverId, { rejectWithValue }) => {
    try {
      return await createOrGetConversationApi(receiverId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start conversation",
      );
    }
  },
);

export const shareToMessage = createAsyncThunk(
  "messages/shareToMessage",
  async (payload, { rejectWithValue }) => {
    try {
      return await shareToMessageApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to share content",
      );
    }
  },
);

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value._id) return normalizeId(value._id);
  if (value.$oid) return String(value.$oid);

  if (
    typeof value.toString === "function" &&
    value.toString !== Object.prototype.toString
  ) {
    return value.toString();
  }

  return "";
};

const sameId = (first, second) => {
  const firstId = normalizeId(first);
  const secondId = normalizeId(second);

  return Boolean(firstId && secondId && firstId === secondId);
};

const upsertMessage = (messages, incomingMessage) => {
  const exists = messages.some(
    (message) => sameId(message._id, incomingMessage._id),
  );

  if (exists) {
    return messages.map((message) =>
      sameId(message._id, incomingMessage._id) ? incomingMessage : message,
    );
  }

  return [...messages, incomingMessage];
};

const getId = normalizeId;

const getConversationKey = (conversation) => {
  if (!conversation) return "";

  if (conversation.isGroup) return normalizeId(conversation._id);

  const participantIds = (conversation.participants || [])
    .map(getId)
    .filter(Boolean)
    .sort();

  return participantIds.length > 1
    ? participantIds.join(":")
    : normalizeId(conversation._id);
};

const getConversationTime = (conversation) => {
  const timestamp =
    conversation?.lastMessage?.createdAt ||
    conversation?.updatedAt ||
    conversation?.createdAt;

  return timestamp ? Date.parse(timestamp) || 0 : 0;
};

const shouldPreferConversation = (incoming, existing) => {
  if (!existing) return true;
  if (incoming?.lastMessage && !existing?.lastMessage) return true;
  if (!incoming?.lastMessage && existing?.lastMessage) return false;

  return getConversationTime(incoming) > getConversationTime(existing);
};

const mergeConversations = (base, incoming) => ({
  ...base,
  ...incoming,
  participants: incoming?.participants?.length
    ? incoming.participants
    : base?.participants,
  lastMessage: incoming?.lastMessage || base?.lastMessage || null,
});

const getUnreadCount = (conversation) =>
  Math.max(Number(conversation?.unreadCount) || 0, 0);

const getConversationIdFromMessage = (message) =>
  normalizeId(message?.conversation) || normalizeId(message?.conversationDetails);

const recalculateUnreadCounts = (state) => {
  state.unreadInboxCount = state.conversations.reduce(
    (total, conversation) => total + getUnreadCount(conversation),
    0,
  );
  state.unreadRequestCount = state.requests.reduce(
    (total, conversation) => total + getUnreadCount(conversation),
    0,
  );
  state.unreadCount = state.unreadInboxCount + state.unreadRequestCount;
};

const dedupeConversations = (conversations = []) => {
  const uniqueConversations = [];
  const keyToIndex = new Map();

  conversations.filter(Boolean).forEach((conversation) => {
    const key = getConversationKey(conversation);

    if (!key || !keyToIndex.has(key)) {
      keyToIndex.set(key, uniqueConversations.length);
      uniqueConversations.push(conversation);
      return;
    }

    const existingIndex = keyToIndex.get(key);
    const existingConversation = uniqueConversations[existingIndex];

    uniqueConversations[existingIndex] = shouldPreferConversation(
      conversation,
      existingConversation,
    )
      ? mergeConversations(existingConversation, conversation)
      : mergeConversations(conversation, existingConversation);
  });

  return uniqueConversations;
};

const upsertConversation = (
  conversations = [],
  incomingConversation,
  moveToTop = false,
) => {
  if (!normalizeId(incomingConversation?._id)) {
    return dedupeConversations(conversations);
  }

  const incomingKey = getConversationKey(incomingConversation);
  const existingIndex = conversations.findIndex(
    (conversation) =>
      sameId(conversation?._id, incomingConversation._id) ||
      (incomingKey && getConversationKey(conversation) === incomingKey),
  );

  if (existingIndex === -1) {
    return dedupeConversations([incomingConversation, ...conversations]);
  }

  const mergedConversation = mergeConversations(
    conversations[existingIndex],
    incomingConversation,
  );

  const remainingConversations = conversations.filter(
    (_, index) => index !== existingIndex,
  );

  if (moveToTop) {
    return dedupeConversations([mergedConversation, ...remainingConversations]);
  }

  const nextConversations = [...remainingConversations];
  nextConversations.splice(existingIndex, 0, mergedConversation);

  return dedupeConversations(nextConversations);
};

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  requests: [],
  onlineUsers: [],
  typingUsers: {},
  unreadCount: 0,
  unreadInboxCount: 0,
  unreadRequestCount: 0,
  page: 1,
  hasMore: true,
  loading: false,
  requestsLoading: false,
  messagesLoading: false,
  sending: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      if (sameId(state.activeConversation?._id, action.payload?._id)) {
        state.activeConversation = action.payload;
        state.error = null;
        return;
      }

      state.activeConversation = action.payload;
      state.messages = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },

    addRealtimeMessage: (state, action) => {
      const message = action.payload;
      const conversationId = getConversationIdFromMessage(message);
      const isActiveConversation = sameId(
        conversationId,
        state.activeConversation?._id,
      );
      const existingConversation =
        state.conversations.find(
          (conversation) => sameId(conversation._id, conversationId),
        ) ||
        state.requests.find((conversation) =>
          sameId(conversation._id, conversationId),
        );
      const incomingConversation = message.conversationDetails ||
        existingConversation ||
        (isActiveConversation
          ? { ...state.activeConversation, lastMessage: message }
          : null);

      if (isActiveConversation) {
        state.messages = upsertMessage(state.messages, message);
      }

      if (incomingConversation) {
        const existingUnreadCount = getUnreadCount(existingConversation);
        const incomingUnreadCount = getUnreadCount(incomingConversation);
        const nextUnreadCount = isActiveConversation
          ? 0
          : Math.max(incomingUnreadCount, existingUnreadCount + 1);
        const updatedConversation = {
          ...incomingConversation,
          lastMessage: message,
          unreadCount: nextUnreadCount,
        };

        if (updatedConversation.status === "requested") {
          state.requests = upsertConversation(
            state.requests,
            updatedConversation,
            true,
          );
        } else {
          state.conversations = upsertConversation(
            state.conversations,
            updatedConversation,
            true,
          );
        }

        if (isActiveConversation) {
          state.activeConversation = {
            ...state.activeConversation,
            lastMessage: message,
            unreadCount: 0,
          };
        }
      } else {
        state.conversations = dedupeConversations(state.conversations);
      }

      recalculateUnreadCounts(state);
    },

    updateRealtimeMessage: (state, action) => {
      const updatedMessage = action.payload;

      state.messages = state.messages.map((message) =>
        sameId(message._id, updatedMessage._id) ? updatedMessage : message,
      );
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },

    setTypingUser: (state, action) => {
      const { conversationId, senderId } = action.payload;

      state.typingUsers[conversationId] = senderId;
    },

    removeTypingUser: (state, action) => {
      const { conversationId } = action.payload;

      delete state.typingUsers[conversationId];
    },

    clearMessagesError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = dedupeConversations(action.payload || []);
        recalculateUnreadCounts(state);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;

        const fetchedMessages = action.payload?.messages || [];
        const pagination = action.payload?.pagination;

        if ((pagination?.page || 1) === 1) {
          state.messages = fetchedMessages;
        } else {
          state.messages = [...fetchedMessages, ...state.messages];
        }

        state.page = pagination?.page || 1;
        state.hasMore = Boolean(pagination?.hasMore);
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages = upsertMessage(state.messages, action.payload);
        const conversationId = getConversationIdFromMessage(action.payload);

        const updatedConversation =
          state.conversations.find(
            (conversation) => sameId(conversation._id, conversationId),
          ) ||
          (sameId(state.activeConversation?._id, conversationId)
            ? { ...state.activeConversation, lastMessage: action.payload }
            : null);

        if (updatedConversation) {
          state.conversations = upsertConversation(
            state.conversations,
            {
              ...updatedConversation,
              lastMessage: action.payload,
              unreadCount: 0,
            },
            true,
          );

          if (sameId(state.activeConversation?._id, conversationId)) {
            state.activeConversation = {
              ...state.activeConversation,
              lastMessage: action.payload,
              unreadCount: 0,
            };
          }
        } else {
          state.conversations = dedupeConversations(state.conversations);
        }

        recalculateUnreadCounts(state);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      .addCase(markConversationSeen.fulfilled, (state, action) => {
        const conversationId = action.payload;

        state.conversations = state.conversations.map((conversation) =>
          sameId(conversation._id, conversationId)
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        );
        state.requests = state.requests.map((conversation) =>
          sameId(conversation._id, conversationId)
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        );

        if (sameId(state.activeConversation?._id, conversationId)) {
          state.activeConversation = {
            ...state.activeConversation,
            unreadCount: 0,
          };
        }

        recalculateUnreadCounts(state);
      })

      .addCase(reactMessage.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          sameId(message._id, action.payload._id) ? action.payload : message,
        );
      })

      .addCase(removeMessageReaction.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          sameId(message._id, action.payload._id) ? action.payload : message,
        );
      })

      .addCase(editMessage.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          sameId(message._id, action.payload._id) ? action.payload : message,
        );
      })

      .addCase(fetchMessageRequests.pending, (state) => {
        state.requestsLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.requests = action.payload || [];
        recalculateUnreadCounts(state);
      })
      .addCase(fetchMessageRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.error = action.payload;
      })

      .addCase(acceptMessageRequest.fulfilled, (state, action) => {
        const acceptedConversation = action.payload;

        state.requests = state.requests.filter(
          (request) => !sameId(request._id, acceptedConversation._id),
        );

        state.conversations = upsertConversation(
          state.conversations,
          { ...acceptedConversation, unreadCount: 0 },
          true,
        );

        recalculateUnreadCounts(state);
      })

      .addCase(rejectMessageRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (request) => !sameId(request._id, action.payload),
        );
        recalculateUnreadCounts(state);
      })

      .addCase(startConversation.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.sending = false;

        const conversation = action.payload;

        if (conversation.status === "accepted") {
          state.conversations = upsertConversation(
            state.conversations,
            { ...conversation, unreadCount: 0 },
            true,
          );
        } else {
          state.conversations = dedupeConversations(state.conversations);
        }

        state.activeConversation = { ...conversation, unreadCount: 0 };
        recalculateUnreadCounts(state);
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      .addCase(shareToMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(shareToMessage.fulfilled, (state, action) => {
        state.sending = false;

        const message = action.payload;
        const conversationId = getConversationIdFromMessage(message);

        if (
          state.activeConversation?._id &&
          sameId(conversationId, state.activeConversation._id)
        ) {
          state.messages = upsertMessage(state.messages, message);
        }

        const updatedConversation =
          state.conversations.find(
            (conversation) => sameId(conversation._id, conversationId),
          ) ||
          (sameId(state.activeConversation?._id, conversationId)
            ? { ...state.activeConversation, lastMessage: message }
            : null);

        if (updatedConversation) {
          state.conversations = upsertConversation(
            state.conversations,
            {
              ...updatedConversation,
              lastMessage: message,
              unreadCount: 0,
            },
            true,
          );

          if (sameId(state.activeConversation?._id, conversationId)) {
            state.activeConversation = {
              ...state.activeConversation,
              lastMessage: message,
              unreadCount: 0,
            };
          }
        } else {
          state.conversations = dedupeConversations(state.conversations);
        }

        recalculateUnreadCounts(state);
      })
      .addCase(shareToMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const {
  addRealtimeMessage,
  clearMessagesError,
  removeTypingUser,
  setActiveConversation,
  setOnlineUsers,
  setTypingUser,
  updateRealtimeMessage,
} = messageSlice.actions;

export default messageSlice.reducer;

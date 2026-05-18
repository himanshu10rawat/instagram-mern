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

const upsertMessage = (messages, incomingMessage) => {
  const exists = messages.some(
    (message) => message._id === incomingMessage._id,
  );

  if (exists) {
    return messages.map((message) =>
      message._id === incomingMessage._id ? incomingMessage : message,
    );
  }

  return [...messages, incomingMessage];
};

const getId = (value) => (typeof value === "string" ? value : value?._id);

const getConversationKey = (conversation) => {
  if (!conversation) return "";

  if (conversation.isGroup) return conversation._id || "";

  const participantIds = (conversation.participants || [])
    .map(getId)
    .filter(Boolean)
    .sort();

  return participantIds.length > 1
    ? participantIds.join(":")
    : conversation._id || "";
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
  if (!incomingConversation?._id) {
    return dedupeConversations(conversations);
  }

  const incomingKey = getConversationKey(incomingConversation);
  const existingIndex = conversations.findIndex(
    (conversation) =>
      conversation?._id === incomingConversation._id ||
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
  page: 1,
  hasMore: true,
  loading: false,
  messagesLoading: false,
  sending: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      if (state.activeConversation?._id === action.payload?._id) {
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

      if (
        state.activeConversation?._id &&
        message.conversation === state.activeConversation._id
      ) {
        state.messages = upsertMessage(state.messages, message);
      }

      state.conversations = state.conversations.map((conversation) =>
        conversation._id === message.conversation
          ? { ...conversation, lastMessage: message }
          : conversation,
      );

      const updatedConversation =
        state.conversations.find(
          (conversation) => conversation._id === message.conversation,
        ) ||
        (state.activeConversation?._id === message.conversation
          ? { ...state.activeConversation, lastMessage: message }
          : null);

      state.conversations = updatedConversation
        ? upsertConversation(state.conversations, updatedConversation, true)
        : dedupeConversations(state.conversations);
    },

    updateRealtimeMessage: (state, action) => {
      const updatedMessage = action.payload;

      state.messages = state.messages.map((message) =>
        message._id === updatedMessage._id ? updatedMessage : message,
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

        const updatedConversation =
          state.conversations.find(
            (conversation) => conversation._id === action.payload.conversation,
          ) ||
          (state.activeConversation?._id === action.payload.conversation
            ? { ...state.activeConversation, lastMessage: action.payload }
            : null);

        if (updatedConversation) {
          state.conversations = upsertConversation(
            state.conversations,
            {
              ...updatedConversation,
              lastMessage: action.payload,
            },
            true,
          );

          if (state.activeConversation?._id === action.payload.conversation) {
            state.activeConversation = {
              ...state.activeConversation,
              lastMessage: action.payload,
            };
          }
        } else {
          state.conversations = dedupeConversations(state.conversations);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      .addCase(reactMessage.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          message._id === action.payload._id ? action.payload : message,
        );
      })

      .addCase(editMessage.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          message._id === action.payload._id ? action.payload : message,
        );
      })

      .addCase(fetchMessageRequests.fulfilled, (state, action) => {
        state.requests = action.payload || [];
      })

      .addCase(acceptMessageRequest.fulfilled, (state, action) => {
        const acceptedConversation = action.payload;

        state.requests = state.requests.filter(
          (request) => request._id !== acceptedConversation._id,
        );

        state.conversations = upsertConversation(
          state.conversations,
          acceptedConversation,
          true,
        );
      })

      .addCase(rejectMessageRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (request) => request._id !== action.payload,
        );
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
            conversation,
            true,
          );
        } else {
          state.conversations = dedupeConversations(state.conversations);
        }

        state.activeConversation = conversation;
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

        if (
          state.activeConversation?._id &&
          message.conversation === state.activeConversation._id
        ) {
          state.messages = upsertMessage(state.messages, message);
        }

        const updatedConversation =
          state.conversations.find(
            (conversation) => conversation._id === message.conversation,
          ) ||
          (state.activeConversation?._id === message.conversation
            ? { ...state.activeConversation, lastMessage: message }
            : null);

        if (updatedConversation) {
          state.conversations = upsertConversation(
            state.conversations,
            {
              ...updatedConversation,
              lastMessage: message,
            },
            true,
          );

          if (state.activeConversation?._id === message.conversation) {
            state.activeConversation = {
              ...state.activeConversation,
              lastMessage: message,
            };
          }
        } else {
          state.conversations = dedupeConversations(state.conversations);
        }
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

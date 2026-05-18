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
        state.conversations = action.payload || [];
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

        state.conversations = state.conversations.map((conversation) =>
          conversation._id === action.payload.conversation
            ? { ...conversation, lastMessage: action.payload }
            : conversation,
        );
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

        state.conversations.unshift(acceptedConversation);
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

        const exists = state.conversations.some(
          (item) => item._id === conversation._id,
        );

        if (!exists && conversation.status === "accepted") {
          state.conversations.unshift(conversation);
        }

        state.activeConversation = conversation;
      })
      .addCase(startConversation.rejected, (state, action) => {
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

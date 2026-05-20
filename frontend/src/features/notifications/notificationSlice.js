import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "../follow/followSlice";
import {
  deleteNotificationApi,
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "./notificationService";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotificationsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
  {
    condition: (arg, { getState }) => {
      const { notifications } = getState();

      if (arg?.force) return true;
      if (notifications.lastFetched && Date.now() - notifications.lastFetched < 30000) {
        return false;
      }

      return !notifications.loading;
    },
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await markNotificationReadApi(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read",
      );
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsReadApi();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read",
      );
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  lastFetched: 0,
  loading: false,
  error: null,
};

const recalculateUnreadCount = (state) => {
  state.unreadCount = state.notifications.filter(
    (notification) => !notification.isRead,
  ).length;
};

const removeFollowRequestNotification = (state, requestId) => {
  state.notifications = state.notifications.filter(
    (notification) => notification.followRequest?._id !== requestId,
  );
  recalculateUnreadCount(state);
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addRealtimeNotification: (state, action) => {
      const notification = action.payload;

      const alreadyExists = state.notifications.some(
        (item) => item._id === notification._id,
      );

      if (!alreadyExists) {
        state.notifications.unshift(notification);

        if (!notification.isRead) {
          state.unreadCount += 1;
        }
      }
    },

    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload || [];
        state.lastFetched = Date.now();
        recalculateUnreadCount(state);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.payload;

        state.notifications = state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        );

        recalculateUnreadCount(state);
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));

        state.unreadCount = 0;
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;

        state.notifications = state.notifications.filter(
          (notification) => notification._id !== notificationId,
        );

        recalculateUnreadCount(state);
      })

      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        removeFollowRequestNotification(state, action.meta.arg);
      })

      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        removeFollowRequestNotification(state, action.meta.arg);
      });
  },
});

export const { addRealtimeNotification, clearNotificationError } =
  notificationSlice.actions;

export default notificationSlice.reducer;

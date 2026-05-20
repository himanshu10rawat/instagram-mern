import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  acceptFollowRequestApi,
  cancelFollowRequestApi,
  followUserApi,
  getFollowRequestsApi,
  rejectFollowRequestApi,
  unfollowUserApi,
} from "./followService";

export const followUser = createAsyncThunk(
  "follow/followUser",
  async (userId, { rejectWithValue }) => {
    try {
      return await followUserApi(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to follow user",
      );
    }
  },
);

export const unfollowUser = createAsyncThunk(
  "follow/unfollowUser",
  async (userId, { rejectWithValue }) => {
    try {
      return await unfollowUserApi(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unfollow user",
      );
    }
  },
);

export const cancelFollowRequest = createAsyncThunk(
  "follow/cancelFollowRequest",
  async (userId, { rejectWithValue }) => {
    try {
      await cancelFollowRequestApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel request",
      );
    }
  },
);

export const fetchFollowRequests = createAsyncThunk(
  "follow/fetchFollowRequests",
  async (_, { rejectWithValue }) => {
    try {
      return await getFollowRequestsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follow requests",
      );
    }
  },
);

export const acceptFollowRequest = createAsyncThunk(
  "follow/acceptFollowRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      return await acceptFollowRequestApi(requestId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to accept request",
      );
    }
  },
);

export const rejectFollowRequest = createAsyncThunk(
  "follow/rejectFollowRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      return await rejectFollowRequestApi(requestId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject request",
      );
    }
  },
);

const initialState = {
  requests: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const getRequestId = (request) => request?._id?.toString?.() || request?._id;

const getFollowRequestFromNotification = (notification) => {
  if (notification?.type !== "follow_request") return null;

  const followRequest = notification.followRequest;

  if (
    !followRequest?._id ||
    (followRequest.status && followRequest.status !== "pending")
  ) {
    return null;
  }

  return {
    ...followRequest,
    sender: notification.sender || followRequest.sender,
    createdAt: followRequest.createdAt || notification.createdAt,
    status: followRequest.status || "pending",
  };
};

const upsertFollowRequest = (state, request) => {
  const requestId = getRequestId(request);

  if (!requestId || request.status !== "pending") return;

  const existingIndex = state.requests.findIndex(
    (item) => getRequestId(item) === requestId,
  );

  if (existingIndex >= 0) {
    state.requests[existingIndex] = {
      ...state.requests[existingIndex],
      ...request,
    };
  } else {
    state.requests.unshift(request);
  }

  state.requests.sort(
    (first, second) =>
      new Date(second.createdAt || 0).getTime() -
      new Date(first.createdAt || 0).getTime(),
  );
};

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    clearFollowError: (state) => {
      state.error = null;
    },

    addFollowRequestFromNotification: (state, action) => {
      upsertFollowRequest(
        state,
        getFollowRequestFromNotification(action.payload),
      );
    },

    syncFollowRequestsFromNotifications: (state, action) => {
      (action.payload || []).forEach((notification) => {
        upsertFollowRequest(
          state,
          getFollowRequestFromNotification(notification),
        );
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(followUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(unfollowUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(cancelFollowRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelFollowRequest.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(cancelFollowRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchFollowRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload || [];
      })
      .addCase(fetchFollowRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        const acceptedRequestId = action.meta.arg;

        state.requests = state.requests.filter(
          (request) => request._id !== acceptedRequestId,
        );
      })

      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        const rejectedRequestId = action.meta.arg;

        state.requests = state.requests.filter(
          (request) => request._id !== rejectedRequestId,
        );
      });
  },
});

export const {
  addFollowRequestFromNotification,
  clearFollowError,
  syncFollowRequestsFromNotifications,
} = followSlice.actions;

export default followSlice.reducer;

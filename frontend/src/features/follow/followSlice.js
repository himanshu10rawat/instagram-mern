import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  acceptFollowRequestApi,
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

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    clearFollowError: (state) => {
      state.error = null;
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

export const { clearFollowError } = followSlice.actions;

export default followSlice.reducer;

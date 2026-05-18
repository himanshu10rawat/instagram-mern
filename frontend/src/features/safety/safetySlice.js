import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  blockUserApi,
  getBlockedUsersApi,
  getMutedUsersApi,
  muteUserApi,
  reportCommentApi,
  reportPostApi,
  reportReelApi,
  reportUserApi,
  unblockUserApi,
  unmuteUserApi,
} from "./safetyService";

export const fetchBlockedUsers = createAsyncThunk(
  "safety/fetchBlockedUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await getBlockedUsersApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blocked users",
      );
    }
  },
);

export const fetchMutedUsers = createAsyncThunk(
  "safety/fetchMutedUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await getMutedUsersApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch muted users",
      );
    }
  },
);

export const blockUser = createAsyncThunk(
  "safety/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      await blockUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to block user",
      );
    }
  },
);

export const unblockUser = createAsyncThunk(
  "safety/unblockUser",
  async (userId, { rejectWithValue }) => {
    try {
      await unblockUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unblock user",
      );
    }
  },
);

export const muteUser = createAsyncThunk(
  "safety/muteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await muteUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mute user",
      );
    }
  },
);

export const unmuteUser = createAsyncThunk(
  "safety/unmuteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await unmuteUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unmute user",
      );
    }
  },
);

export const reportUser = createAsyncThunk(
  "safety/reportUser",
  async (payload, { rejectWithValue }) => {
    try {
      return await reportUserApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to report user",
      );
    }
  },
);

export const reportPost = createAsyncThunk(
  "safety/reportPost",
  async (payload, { rejectWithValue }) => {
    try {
      return await reportPostApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to report post",
      );
    }
  },
);

export const reportReel = createAsyncThunk(
  "safety/reportReel",
  async (payload, { rejectWithValue }) => {
    try {
      return await reportReelApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to report reel",
      );
    }
  },
);

export const reportComment = createAsyncThunk(
  "safety/reportComment",
  async (payload, { rejectWithValue }) => {
    try {
      return await reportCommentApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to report comment",
      );
    }
  },
);

const initialState = {
  blockedUsers: [],
  mutedUsers: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const safetySlice = createSlice({
  name: "safety",
  initialState,
  reducers: {
    clearSafetyStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    resetSafety: (state) => {
      state.blockedUsers = [];
      state.mutedUsers = [];
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.blockedUsers = action.payload || [];
      })
      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMutedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMutedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.mutedUsers = action.payload || [];
      })
      .addCase(fetchMutedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(blockUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "User blocked successfully";
        state.mutedUsers = state.mutedUsers.filter(
          (user) => user._id !== action.payload,
        );
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(unblockUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.blockedUsers = state.blockedUsers.filter(
          (user) => user._id !== action.payload,
        );
        state.successMessage = "User unblocked successfully";
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(muteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(muteUser.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = "User muted successfully";
      })
      .addCase(muteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(unmuteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(unmuteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.mutedUsers = state.mutedUsers.filter(
          (user) => user._id !== action.payload,
        );
        state.successMessage = "User unmuted successfully";
      })
      .addCase(unmuteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addMatcher(
        (action) =>
          [
            reportUser.pending.type,
            reportPost.pending.type,
            reportReel.pending.type,
            reportComment.pending.type,
          ].includes(action.type),
        (state) => {
          state.actionLoading = true;
          state.error = null;
          state.successMessage = "";
        },
      )
      .addMatcher(
        (action) =>
          [
            reportUser.fulfilled.type,
            reportPost.fulfilled.type,
            reportReel.fulfilled.type,
            reportComment.fulfilled.type,
          ].includes(action.type),
        (state) => {
          state.actionLoading = false;
          state.successMessage = "Report submitted successfully";
        },
      )
      .addMatcher(
        (action) =>
          [
            reportUser.rejected.type,
            reportPost.rejected.type,
            reportReel.rejected.type,
            reportComment.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSafetyStatus, resetSafety } = safetySlice.actions;

export default safetySlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  blockAdminUserApi,
  deleteAdminCommentApi,
  deleteAdminPostApi,
  deleteAdminReelApi,
  deleteReportApi,
  getAdminDashboardApi,
  getAdminPostsApi,
  getAdminReelsApi,
  getAdminReportsApi,
  getAdminUsersApi,
  resolveReportApi,
  unblockAdminUserApi,
  updateAdminUserRoleApi,
} from "./adminService";

export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminDashboardApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin dashboard",
      );
    }
  },
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchAdminUsers",
  async (params, { rejectWithValue }) => {
    try {
      return await getAdminUsersApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const blockAdminUser = createAsyncThunk(
  "admin/blockAdminUser",
  async (userId, { rejectWithValue }) => {
    try {
      await blockAdminUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to block user",
      );
    }
  },
);

export const unblockAdminUser = createAsyncThunk(
  "admin/unblockAdminUser",
  async (userId, { rejectWithValue }) => {
    try {
      await unblockAdminUserApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unblock user",
      );
    }
  },
);

export const fetchAdminPosts = createAsyncThunk(
  "admin/fetchAdminPosts",
  async (params, { rejectWithValue }) => {
    try {
      return await getAdminPostsApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts",
      );
    }
  },
);

export const fetchAdminReels = createAsyncThunk(
  "admin/fetchAdminReels",
  async (params, { rejectWithValue }) => {
    try {
      return await getAdminReelsApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reels",
      );
    }
  },
);

export const updateAdminUserRole = createAsyncThunk(
  "admin/updateAdminUserRole",
  async (payload, { rejectWithValue }) => {
    try {
      return await updateAdminUserRoleApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user role",
      );
    }
  },
);

export const fetchAdminReports = createAsyncThunk(
  "admin/fetchAdminReports",
  async (params, { rejectWithValue }) => {
    try {
      return await getAdminReportsApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reports",
      );
    }
  },
);

export const resolveAdminReport = createAsyncThunk(
  "admin/resolveAdminReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await resolveReportApi(reportId);
      return reportId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resolve report",
      );
    }
  },
);

export const deleteAdminReport = createAsyncThunk(
  "admin/deleteAdminReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await deleteReportApi(reportId);
      return reportId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete report",
      );
    }
  },
);

export const deleteAdminPost = createAsyncThunk(
  "admin/deleteAdminPost",
  async (postId, { rejectWithValue }) => {
    try {
      await deleteAdminPostApi(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post",
      );
    }
  },
);

export const deleteAdminReel = createAsyncThunk(
  "admin/deleteAdminReel",
  async (reelId, { rejectWithValue }) => {
    try {
      await deleteAdminReelApi(reelId);
      return reelId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete reel",
      );
    }
  },
);

export const deleteAdminComment = createAsyncThunk(
  "admin/deleteAdminComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await deleteAdminCommentApi(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment",
      );
    }
  },
);

const initialState = {
  dashboard: null,
  users: [],
  posts: [],
  reels: [],
  reports: [],
  pagination: null,
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const updateUserBlockStatus = (users, userId, isBlockedByAdmin) => {
  return users.map((user) =>
    user._id === userId ? { ...user, isBlockedByAdmin } : user,
  );
};

const replaceUser = (users, updatedUser) => {
  return users.map((user) =>
    user._id === updatedUser._id ? { ...user, ...updatedUser } : user,
  );
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    resetAdmin: (state) => {
      state.dashboard = null;
      state.users = [];
      state.posts = [];
      state.reels = [];
      state.reports = [];
      state.pagination = null;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.users || action.payload || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload?.posts || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchAdminPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminReels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReels.fulfilled, (state, action) => {
        state.loading = false;
        state.reels = action.payload?.reels || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchAdminReels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload?.reports || action.payload || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchAdminReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(blockAdminUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(blockAdminUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = updateUserBlockStatus(state.users, action.payload, true);
        state.successMessage = "User blocked successfully";
      })
      .addCase(blockAdminUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(unblockAdminUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(unblockAdminUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = updateUserBlockStatus(state.users, action.payload, false);
        state.successMessage = "User unblocked successfully";
      })
      .addCase(unblockAdminUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(updateAdminUserRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = replaceUser(state.users, action.payload);
        state.successMessage = "User role updated successfully";
      })
      .addCase(updateAdminUserRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addMatcher(
        (action) =>
          [
            resolveAdminReport.pending.type,
            deleteAdminReport.pending.type,
            deleteAdminPost.pending.type,
            deleteAdminReel.pending.type,
            deleteAdminComment.pending.type,
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
            resolveAdminReport.fulfilled.type,
            deleteAdminReport.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.reports = state.reports.filter(
            (report) => report._id !== action.payload,
          );
          state.successMessage = "Report updated successfully";
        },
      )
      .addMatcher(
        (action) =>
          [
            deleteAdminPost.fulfilled.type,
            deleteAdminReel.fulfilled.type,
            deleteAdminComment.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.posts = state.posts.filter((post) => post._id !== action.payload);
          state.reels = state.reels.filter((reel) => reel._id !== action.payload);
          state.successMessage = "Content removed successfully";
        },
      )
      .addMatcher(
        (action) =>
          [
            resolveAdminReport.rejected.type,
            deleteAdminReport.rejected.type,
            deleteAdminPost.rejected.type,
            deleteAdminReel.rejected.type,
            deleteAdminComment.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearAdminStatus, resetAdmin } = adminSlice.actions;

export default adminSlice.reducer;

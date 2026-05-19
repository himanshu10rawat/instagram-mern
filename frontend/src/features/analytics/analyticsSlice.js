import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getCreatorDashboardStatsApi,
  getPostAnalyticsApi,
  getProfileVisitsAnalyticsApi,
  getReelAnalyticsApi,
} from "./analyticsService";

export const fetchCreatorDashboardStats = createAsyncThunk(
  "analytics/fetchCreatorDashboardStats",
  async (days = 30, { rejectWithValue }) => {
    try {
      return await getCreatorDashboardStatsApi(days);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics dashboard",
      );
    }
  },
);

export const fetchProfileVisitsAnalytics = createAsyncThunk(
  "analytics/fetchProfileVisitsAnalytics",
  async (days = 30, { rejectWithValue }) => {
    try {
      return await getProfileVisitsAnalyticsApi(days);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile visits",
      );
    }
  },
);

export const fetchPostAnalytics = createAsyncThunk(
  "analytics/fetchPostAnalytics",
  async (postId, { rejectWithValue }) => {
    try {
      return await getPostAnalyticsApi(postId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post analytics",
      );
    }
  },
);

export const fetchReelAnalytics = createAsyncThunk(
  "analytics/fetchReelAnalytics",
  async (reelId, { rejectWithValue }) => {
    try {
      return await getReelAnalyticsApi(reelId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reel analytics",
      );
    }
  },
);

const initialState = {
  dashboardStats: null,
  profileVisits: [],
  postAnalytics: null,
  reelAnalytics: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },

    resetAnalyticsDetails: (state) => {
      state.postAnalytics = null;
      state.reelAnalytics = null;
      state.detailLoading = false;
      state.error = null;
    },

    resetAnalytics: (state) => {
      state.dashboardStats = null;
      state.profileVisits = [];
      state.postAnalytics = null;
      state.reelAnalytics = null;
      state.loading = false;
      state.detailLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreatorDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreatorDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchCreatorDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProfileVisitsAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileVisitsAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.profileVisits = action.payload || [];
      })
      .addCase(fetchProfileVisitsAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPostAnalytics.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchPostAnalytics.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.postAnalytics = action.payload;
      })
      .addCase(fetchPostAnalytics.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchReelAnalytics.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchReelAnalytics.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.reelAnalytics = action.payload;
      })
      .addCase(fetchReelAnalytics.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalyticsError, resetAnalytics, resetAnalyticsDetails } =
  analyticsSlice.actions;

export default analyticsSlice.reducer;

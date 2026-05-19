import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  endLiveApi,
  getActiveLivesApi,
  getAgoraRtcTokenApi,
  joinLiveApi,
  leaveLiveApi,
  startLiveApi,
} from "./liveService";

export const fetchActiveLives = createAsyncThunk(
  "live/fetchActiveLives",
  async (_, { rejectWithValue }) => {
    try {
      return await getActiveLivesApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch live sessions",
      );
    }
  },
);

export const startLive = createAsyncThunk(
  "live/startLive",
  async (payload, { rejectWithValue }) => {
    try {
      return await startLiveApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start live",
      );
    }
  },
);

export const joinLive = createAsyncThunk(
  "live/joinLive",
  async (liveId, { rejectWithValue }) => {
    try {
      return await joinLiveApi(liveId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to join live",
      );
    }
  },
);

export const leaveLive = createAsyncThunk(
  "live/leaveLive",
  async (liveId, { rejectWithValue }) => {
    try {
      await leaveLiveApi(liveId);

      return liveId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to leave live",
      );
    }
  },
);

export const endLive = createAsyncThunk(
  "live/endLive",
  async (liveId, { rejectWithValue }) => {
    try {
      await endLiveApi(liveId);

      return liveId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to end live",
      );
    }
  },
);

export const fetchAgoraRtcToken = createAsyncThunk(
  "live/fetchAgoraRtcToken",
  async (payload, { rejectWithValue }) => {
    try {
      return await getAgoraRtcTokenApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate Agora token",
      );
    }
  },
);

const initialState = {
  activeLives: [],
  currentLive: null,
  agoraTokenData: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {
    clearLiveError: (state) => {
      state.error = null;
    },

    resetCurrentLive: (state) => {
      state.currentLive = null;
      state.agoraTokenData = null;
      state.actionLoading = false;
      state.error = null;
    },

    resetLiveState: (state) => {
      state.activeLives = [];
      state.currentLive = null;
      state.agoraTokenData = null;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveLives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveLives.fulfilled, (state, action) => {
        state.loading = false;
        state.activeLives = action.payload || [];
      })
      .addCase(fetchActiveLives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(startLive.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(startLive.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentLive = action.payload;
      })
      .addCase(startLive.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(joinLive.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(joinLive.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentLive = action.payload;
      })
      .addCase(joinLive.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchAgoraRtcToken.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(fetchAgoraRtcToken.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.agoraTokenData = action.payload;
      })
      .addCase(fetchAgoraRtcToken.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(leaveLive.fulfilled, (state) => {
        state.currentLive = null;
        state.agoraTokenData = null;
      })

      .addCase(endLive.fulfilled, (state, action) => {
        state.currentLive = null;
        state.agoraTokenData = null;
        state.activeLives = state.activeLives.filter(
          (live) => live._id !== action.payload,
        );
      });
  },
});

export const { clearLiveError, resetCurrentLive, resetLiveState } =
  liveSlice.actions;

export default liveSlice.reducer;

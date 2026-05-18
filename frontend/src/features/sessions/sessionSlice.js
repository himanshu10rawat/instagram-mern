import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getMySessionsApi,
  revokeAllSessionsApi,
  revokeSessionApi,
} from "./sessionService";

export const fetchSessions = createAsyncThunk(
  "sessions/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      return await getMySessionsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sessions",
      );
    }
  },
);

export const revokeSession = createAsyncThunk(
  "sessions/revokeSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await revokeSessionApi(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to revoke session",
      );
    }
  },
);

export const revokeAllSessions = createAsyncThunk(
  "sessions/revokeAllSessions",
  async (_, { rejectWithValue }) => {
    try {
      await revokeAllSessionsApi();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to revoke all sessions",
      );
    }
  },
);

const initialState = {
  sessions: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    clearSessionStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    resetSessions: (state) => {
      state.sessions = [];
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload || [];
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(revokeSession.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(revokeSession.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.sessions = state.sessions.filter(
          (session) => session._id !== action.payload,
        );
        state.successMessage = "Session revoked successfully";
      })
      .addCase(revokeSession.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(revokeAllSessions.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(revokeAllSessions.fulfilled, (state) => {
        state.actionLoading = false;
        state.sessions = [];
        state.successMessage = "All sessions revoked successfully";
      })
      .addCase(revokeAllSessions.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSessionStatus, resetSessions } = sessionSlice.actions;

export default sessionSlice.reducer;

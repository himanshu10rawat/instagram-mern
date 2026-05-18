import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  disableTwoFactorApi,
  enableTwoFactorApi,
  regenerateBackupCodesApi,
  setupTwoFactorApi,
} from "./twoFactorService";

export const setupTwoFactor = createAsyncThunk(
  "twoFactor/setupTwoFactor",
  async (_, { rejectWithValue }) => {
    try {
      return await setupTwoFactorApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to setup 2FA",
      );
    }
  },
);

export const enableTwoFactor = createAsyncThunk(
  "twoFactor/enableTwoFactor",
  async (token, { rejectWithValue }) => {
    try {
      return await enableTwoFactorApi(token);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to enable 2FA",
      );
    }
  },
);

export const disableTwoFactor = createAsyncThunk(
  "twoFactor/disableTwoFactor",
  async (token, { rejectWithValue }) => {
    try {
      await disableTwoFactorApi(token);

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to disable 2FA",
      );
    }
  },
);

export const regenerateBackupCodes = createAsyncThunk(
  "twoFactor/regenerateBackupCodes",
  async (token, { rejectWithValue }) => {
    try {
      return await regenerateBackupCodesApi(token);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to regenerate backup codes",
      );
    }
  },
);

const initialState = {
  setupData: null,
  backupCodes: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const twoFactorSlice = createSlice({
  name: "twoFactor",
  initialState,
  reducers: {
    clearTwoFactorStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    clearTwoFactorSetup: (state) => {
      state.setupData = null;
      state.backupCodes = [];
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setupTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(setupTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.setupData = action.payload;
        state.successMessage = "Scan QR code with your authenticator app.";
      })
      .addCase(setupTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(enableTwoFactor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(enableTwoFactor.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.backupCodes = action.payload?.backupCodes || [];
        state.setupData = null;
        state.successMessage = "2FA enabled successfully.";
      })
      .addCase(enableTwoFactor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(disableTwoFactor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(disableTwoFactor.fulfilled, (state) => {
        state.actionLoading = false;
        state.setupData = null;
        state.backupCodes = [];
        state.successMessage = "2FA disabled successfully.";
      })
      .addCase(disableTwoFactor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(regenerateBackupCodes.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(regenerateBackupCodes.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.backupCodes = action.payload?.backupCodes || [];
        state.successMessage = "Backup codes regenerated successfully.";
      })
      .addCase(regenerateBackupCodes.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTwoFactorSetup, clearTwoFactorStatus } =
  twoFactorSlice.actions;

export default twoFactorSlice.reducer;

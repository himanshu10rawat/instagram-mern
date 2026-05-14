import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../lib/axios";

const getInitialUser = () => {
  try {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (key) => {
  const value = localStorage.getItem(key);

  return value && value !== "undefined" && value !== "null" ? value : null;
};

const clearStoredCredentials = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const applyCredentials = (state, payload) => {
  const user = payload?.user || null;
  const accessToken = payload?.accessToken || null;
  const refreshToken = payload?.refreshToken || null;

  state.user = user;
  state.accessToken = accessToken;
  state.refreshToken = refreshToken;
  state.isAuthenticated = Boolean(accessToken);
  state.requiresTwoFactor = false;
  state.twoFactorUserId = null;
  state.error = null;

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  } else {
    localStorage.removeItem("accessToken");
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

export const loginUser = createAsyncThunk(
  "/auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", payload);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", payload);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");

      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

const initialState = {
  user: getInitialUser(),
  accessToken: getStoredToken("accessToken"),
  refreshToken: getStoredToken("refreshToken"),
  isAuthenticated: Boolean(getStoredToken("accessToken")),
  requiresTwoFactor: false,
  twoFactorUserId: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    logoutLocally: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.requiresTwoFactor = false;
      state.twoFactorUserId = null;

      clearStoredCredentials();
    },

    setCredentials: (state, action) => {
      applyCredentials(state, action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.requiresTwoFactor) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.requiresTwoFactor = true;
          state.twoFactorUserId = action.payload.userId;
          clearStoredCredentials();
          return;
        }

        applyCredentials(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;

        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.requiresTwoFactor = false;
        state.twoFactorUserId = null;

        clearStoredCredentials();
      });
  },
});

export const { clearAuthError, logoutLocally, setCredentials } =
  authSlice.actions;

export default authSlice.reducer;

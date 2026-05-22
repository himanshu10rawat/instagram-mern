import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { disconnectSocket } from "../../lib/socket";
import {
  changePasswordApi,
  forgotPasswordApi,
  getCurrentUserApi,
  loginUserApi,
  logoutUserApi,
  registerUserApi,
  requestSignupVerificationApi,
  resetPasswordApi,
} from "./authService";

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

const fieldLabels = {
  username: "Username",
  fullName: "Full name",
  email: "Email",
  emailOtp: "Email code",
  password: "Password",
  dateOfBirth: "Date of birth",
};

const normalizeApiErrors = (errors = []) =>
  errors
    .map((error) => {
      if (typeof error === "string") {
        return {
          field: "",
          message: error,
        };
      }

      return {
        field: error?.field || "",
        message: error?.message || "",
      };
    })
    .filter((error) => error.message);

const formatErrorMessage = (error) => {
  const label = fieldLabels[error.field];

  if (!label || error.message.toLowerCase().startsWith(label.toLowerCase())) {
    return error.message;
  }

  return `${label}: ${error.message}`;
};

const getApiErrorPayload = (error, fallbackMessage) => {
  const data = error.response?.data;
  const errors = normalizeApiErrors(data?.errors);
  const message = errors.length
    ? errors.map(formatErrorMessage).join(". ")
    : data?.message || fallbackMessage;

  return {
    message,
    errors,
  };
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
  state.successMessage = "";

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

const resetAuthState = (state) => {
  state.user = null;
  state.accessToken = null;
  state.refreshToken = null;
  state.isAuthenticated = false;
  state.requiresTwoFactor = false;
  state.twoFactorUserId = null;
  state.loading = false;
  state.error = null;
  state.successMessage = "";

  clearStoredCredentials();
  disconnectSocket();
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      return await loginUserApi(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      return await registerUserApi(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, "Registration failed"));
    }
  },
);

export const requestSignupVerification = createAsyncThunk(
  "auth/requestSignupVerification",
  async (payload, { rejectWithValue }) => {
    try {
      return await requestSignupVerificationApi(payload);
    } catch (error) {
      return rejectWithValue(
        getApiErrorPayload(error, "Failed to send verification codes"),
      );
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentUserApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    try {
      await logoutUserApi();
      return true;
    } catch {
      return false;
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await changePasswordApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await forgotPasswordApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset email",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await resetPasswordApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password",
      );
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
  successMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    clearAuthStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    logoutLocally: (state) => {
      resetAuthState(state);
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
        state.successMessage = "";
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
        state.successMessage = "";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Account created successfully";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      .addCase(requestSignupVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(requestSignupVerification.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Email verification code sent successfully";
      })
      .addCase(requestSignupVerification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to send verification code";
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;

        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        resetAuthState(state);
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Password reset link sent successfully";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Password reset successfully";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearAuthError,
  clearAuthStatus,
  logoutLocally,
  setCredentials,
} = authSlice.actions;

export default authSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getMyProfileApi,
  getUserProfileApi,
  removeAccountApi,
  updateAvatarApi,
  updateCoverApi,
  updatePrivacySettingsApi,
  updateProfileApi,
} from "./profileService";

export const fetchMyProfile = createAsyncThunk(
  "profile/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyProfileApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (username, { rejectWithValue }) => {
    try {
      return await getUserProfileApi(username);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      return await updateProfileApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

export const updateAvatar = createAsyncThunk(
  "profile/updateAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      return await updateAvatarApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update avatar",
      );
    }
  },
);

export const updateCover = createAsyncThunk(
  "profile/updateCover",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("coverImage", file);

      return await updateCoverApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cover",
      );
    }
  },
);

export const updatePrivacySettings = createAsyncThunk(
  "profile/updatePrivacySettings",
  async (payload, { rejectWithValue }) => {
    try {
      return await updatePrivacySettingsApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update privacy settings",
      );
    }
  },
);

export const removeAccount = createAsyncThunk(
  "profile/removeAccount",
  async (password, { rejectWithValue }) => {
    try {
      return await removeAccountApi(password);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove account",
      );
    }
  },
);

const initialState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
  successMessage: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },
    resetProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.updating = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.successMessage = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      .addCase(updateAvatar.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.successMessage = "Avatar updated successfully";
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      .addCase(updateCover.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCover.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.successMessage = "Cover updated successfully";
      })
      .addCase(updateCover.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      .addCase(updatePrivacySettings.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.successMessage = "Privacy settings updated successfully";
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      .addCase(removeAccount.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(removeAccount.fulfilled, (state) => {
        state.updating = false;
        state.profile = null;
        state.successMessage = "Account removed successfully";
      })
      .addCase(removeAccount.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileStatus, resetProfile } = profileSlice.actions;

export default profileSlice.reducer;

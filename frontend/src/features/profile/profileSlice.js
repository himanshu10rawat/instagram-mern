import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getMyProfileApi,
  getUserProfileApi,
  removeAccountApi,
  updateAvatarApi,
  updatePrivacySettingsApi,
  updateProfileApi,
  getMySavedProfilePostsApi,
  getUserPostsApi,
  getUserReelsApi,
} from "./profileService";
import { FORM_DATA_FIELDS } from "../../constants/apiRoutes";

const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error.response?.data;
  const details = (data?.errors || [])
    .map((item) => {
      if (typeof item === "string") return item;

      return item?.field ? `${item.field}: ${item.message}` : item?.message;
    })
    .filter(Boolean)
    .join(" ");

  if (data?.message && details) {
    return `${data.message}. ${details}`;
  }

  return data?.message || details || fallbackMessage;
};

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

export const fetchProfilePosts = createAsyncThunk(
  "profile/fetchProfilePosts",
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserPostsApi(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile posts",
      );
    }
  },
);

export const fetchProfileReels = createAsyncThunk(
  "profile/fetchProfileReels",
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserReelsApi(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile reels",
      );
    }
  },
);

export const fetchProfileSavedPosts = createAsyncThunk(
  "profile/fetchProfileSavedPosts",
  async (_, { rejectWithValue }) => {
    try {
      return await getMySavedProfilePostsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch saved posts",
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
      formData.append(FORM_DATA_FIELDS.profile.avatar, file);
      return await updateAvatarApi(formData);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update avatar"),
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
  profilePosts: [],
  profileReels: [],
  savedPosts: [],
  activeTab: "posts",
  loading: false,
  tabLoading: false,
  updating: false,
  error: null,
  tabError: null,
  successMessage: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileStatus: (state) => {
      state.error = null;
      state.tabError = null;
      state.successMessage = "";
    },

    setProfileActiveTab: (state, action) => {
      state.activeTab = action.payload;
      state.tabError = null;
    },

    resetProfile: (state) => {
      state.profile = null;
      state.profilePosts = [];
      state.profileReels = [];
      state.savedPosts = [];
      state.activeTab = "posts";
      state.loading = false;
      state.tabLoading = false;
      state.updating = false;
      state.error = null;
      state.tabError = null;
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
      })
      .addCase(fetchProfilePosts.pending, (state) => {
        state.tabLoading = true;
        state.tabError = null;
      })
      .addCase(fetchProfilePosts.fulfilled, (state, action) => {
        state.tabLoading = false;
        state.profilePosts = action.payload || [];
      })
      .addCase(fetchProfilePosts.rejected, (state, action) => {
        state.tabLoading = false;
        state.tabError = action.payload;
      })

      .addCase(fetchProfileReels.pending, (state) => {
        state.tabLoading = true;
        state.tabError = null;
      })
      .addCase(fetchProfileReels.fulfilled, (state, action) => {
        state.tabLoading = false;
        state.profileReels = action.payload || [];
      })
      .addCase(fetchProfileReels.rejected, (state, action) => {
        state.tabLoading = false;
        state.tabError = action.payload;
      })

      .addCase(fetchProfileSavedPosts.pending, (state) => {
        state.tabLoading = true;
        state.tabError = null;
      })
      .addCase(fetchProfileSavedPosts.fulfilled, (state, action) => {
        state.tabLoading = false;
        state.savedPosts = action.payload || [];
      })
      .addCase(fetchProfileSavedPosts.rejected, (state, action) => {
        state.tabLoading = false;
        state.tabError = action.payload;
      });
  },
});

export const { clearProfileStatus, resetProfile, setProfileActiveTab } =
  profileSlice.actions;

export default profileSlice.reducer;

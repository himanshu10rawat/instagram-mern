import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  addCloseFriendApi,
  getCloseFriendsApi,
  removeCloseFriendApi,
} from "./closeFriendService";

const getUserId = (user) => user?._id?.toString?.() || user?._id || user;

export const fetchCloseFriends = createAsyncThunk(
  "closeFriends/fetchCloseFriends",
  async (_, { rejectWithValue }) => {
    try {
      return await getCloseFriendsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch close friends",
      );
    }
  },
);

export const addCloseFriend = createAsyncThunk(
  "closeFriends/addCloseFriend",
  async ({ userId, user }, { rejectWithValue }) => {
    try {
      await addCloseFriendApi(userId);
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add close friend",
      );
    }
  },
);

export const removeCloseFriend = createAsyncThunk(
  "closeFriends/removeCloseFriend",
  async (userId, { rejectWithValue }) => {
    try {
      await removeCloseFriendApi(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove close friend",
      );
    }
  },
);

const initialState = {
  friends: [],
  loading: false,
  actionLoadingById: {},
  error: null,
  successMessage: "",
};

const closeFriendSlice = createSlice({
  name: "closeFriends",
  initialState,
  reducers: {
    clearCloseFriendStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    resetCloseFriends: (state) => {
      state.friends = [];
      state.loading = false;
      state.actionLoadingById = {};
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCloseFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCloseFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload || [];
      })
      .addCase(fetchCloseFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCloseFriend.pending, (state, action) => {
        const userId = action.meta.arg?.userId;

        if (userId) {
          state.actionLoadingById[userId] = true;
        }

        state.error = null;
        state.successMessage = "";
      })
      .addCase(addCloseFriend.fulfilled, (state, action) => {
        const user = action.payload;
        const userId = getUserId(user);

        if (userId) {
          delete state.actionLoadingById[userId];
        }

        if (
          user?._id &&
          !state.friends.some((friend) => getUserId(friend) === userId)
        ) {
          state.friends.unshift(user);
        }

        state.successMessage = "User added to close friends";
      })
      .addCase(addCloseFriend.rejected, (state, action) => {
        const userId = action.meta.arg?.userId;

        if (userId) {
          delete state.actionLoadingById[userId];
        }

        state.error = action.payload;
      })

      .addCase(removeCloseFriend.pending, (state, action) => {
        const userId = action.meta.arg;

        if (userId) {
          state.actionLoadingById[userId] = true;
        }

        state.error = null;
        state.successMessage = "";
      })
      .addCase(removeCloseFriend.fulfilled, (state, action) => {
        const userId = action.payload;

        delete state.actionLoadingById[userId];

        state.friends = state.friends.filter(
          (friend) => getUserId(friend) !== userId,
        );
        state.successMessage = "User removed from close friends";
      })
      .addCase(removeCloseFriend.rejected, (state, action) => {
        const userId = action.meta.arg;

        if (userId) {
          delete state.actionLoadingById[userId];
        }

        state.error = action.payload;
      });
  },
});

export const { clearCloseFriendStatus, resetCloseFriends } =
  closeFriendSlice.actions;

export default closeFriendSlice.reducer;

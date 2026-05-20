import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getSuggestedUsersApi } from "./recommendationService";

export const fetchSuggestedUsers = createAsyncThunk(
  "recommendations/fetchSuggestedUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await getSuggestedUsersApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch suggested users",
      );
    }
  },
  {
    condition: (arg, { getState }) => {
      const { recommendations } = getState();

      if (arg?.force) return true;
      if (
        recommendations.users.length > 0 &&
        Date.now() - recommendations.lastFetched < 60000
      ) {
        return false;
      }

      return !recommendations.loading;
    },
  },
);

const initialState = {
  users: [],
  lastFetched: 0,
  loading: false,
  error: null,
};

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
        state.lastFetched = Date.now();
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;

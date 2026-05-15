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
);

const initialState = {
  users: [],
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
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;

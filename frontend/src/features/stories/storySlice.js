import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getStoriesFeedApi, likeStoryApi, viewStoryApi } from "./storyService";

export const fetchStoriesFeed = createAsyncThunk(
  "stories/fetchStoriesFeed",
  async (_, { rejectWithValue }) => {
    try {
      return await getStoriesFeedApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stories",
      );
    }
  },
);

export const viewStory = createAsyncThunk(
  "stories/viewStory",
  async (storyId, { rejectWithValue }) => {
    try {
      return await viewStoryApi(storyId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to view story",
      );
    }
  },
);

export const likeStory = createAsyncThunk(
  "stories/likeStory",
  async (storyId, { rejectWithValue }) => {
    try {
      return await likeStoryApi(storyId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to like story",
      );
    }
  },
);

const initialState = {
  stories: [],
  loading: false,
  error: null,
};

const storySlice = createSlice({
  name: "stories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoriesFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoriesFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload || [];
      })
      .addCase(fetchStoriesFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default storySlice.reducer;

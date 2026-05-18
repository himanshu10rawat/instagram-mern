import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createPostApi, createReelApi, createStoryApi } from "./createService";

export const createPost = createAsyncThunk(
  "create/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      return await createPostApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post",
      );
    }
  },
);

export const createStory = createAsyncThunk(
  "create/createStory",
  async (formData, { rejectWithValue }) => {
    try {
      return await createStoryApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create story",
      );
    }
  },
);

export const createReel = createAsyncThunk(
  "create/createReel",
  async (formData, { rejectWithValue }) => {
    try {
      return await createReelApi(formData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create reel",
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  successMessage: "",
};

const createSliceState = createSlice({
  name: "create",
  initialState,
  reducers: {
    clearCreateStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Post created successfully";
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createStory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createStory.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Story created successfully";
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createReel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createReel.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Reel created successfully";
      })
      .addCase(createReel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCreateStatus } = createSliceState.actions;

export default createSliceState.reducer;

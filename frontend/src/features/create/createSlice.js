import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createPostApi, createReelApi, createStoryApi } from "./createService";

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

export const createPost = createAsyncThunk(
  "create/createPost",
  async (formData, { rejectWithValue }) => {
    try {
      return await createPostApi(formData);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create post"));
    }
  },
);

export const createReel = createAsyncThunk(
  "create/createReel",
  async (formData, { rejectWithValue }) => {
    try {
      return await createReelApi(formData);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create reel"));
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
        getApiErrorMessage(error, "Failed to create story"),
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  successMessage: "",
  createdContent: null,
};

const createSliceState = createSlice({
  name: "create",
  initialState,
  reducers: {
    clearCreateStatus: (state) => {
      state.error = null;
      state.successMessage = "";
      state.createdContent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.createdContent = action.payload;
        state.successMessage = "Post created successfully";
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createReel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createReel.fulfilled, (state, action) => {
        state.loading = false;
        state.createdContent = action.payload;
        state.successMessage = "Reel created successfully";
      })
      .addCase(createReel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createStory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loading = false;
        state.createdContent = action.payload;
        state.successMessage = "Story created successfully";
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCreateStatus } = createSliceState.actions;

export default createSliceState.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getFeedPostApi, likePostApi, savePostApi } from "./postService";

export const fetchFeedPosts = createAsyncThunk(
  "posts/fetchFeedPosts",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await getFeedPostApi({ page, limit });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch feed",
      );
    }
  },
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async (payload, { rejectWithValue }) => {
    try {
      const { postId, isLiked = false } =
        typeof payload === "string" ? { postId: payload } : payload;

      return await likePostApi(postId, isLiked);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to like post",
      );
    }
  },
);

export const savePost = createAsyncThunk(
  "posts/savePost",
  async (payload, { rejectWithValue }) => {
    try {
      const { postId, isSaved = false } =
        typeof payload === "string" ? { postId: payload } : payload;

      return await savePostApi(postId, isSaved);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save post",
      );
    }
  },
);

const initialState = {
  posts: [],
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
};

const replacePostById = (posts, updatedPost) => {
  if (!updatedPost?._id) return posts;

  return posts.map((post) => (post._id === updatedPost._id ? updatedPost : post));
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    resetFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;

        const newPosts = action.payload?.posts || [];
        const pagination = action.payload?.pagination;

        if ((pagination?.page || 1) === 1) {
          state.posts = newPosts;
        } else {
          state.posts = [...state.posts, ...newPosts];
        }

        state.page = pagination?.page || 1;
        state.hasMore = Boolean(pagination?.hasMore);
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.posts = replacePostById(state.posts, action.payload);
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.posts = replacePostById(state.posts, action.payload);
      });
  },
});

export const { clearPostError, resetFeed } = postSlice.actions;

export default postSlice.reducer;

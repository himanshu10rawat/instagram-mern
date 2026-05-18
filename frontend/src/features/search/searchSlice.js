import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getTrendingContentApi,
  searchHashtagsApi,
  searchPostsApi,
  searchReelsApi,
  searchUsersApi,
} from "./searchService";

export const searchAll = createAsyncThunk(
  "search/searchAll",
  async (query, { rejectWithValue }) => {
    try {
      const [users, posts, reels, hashtags] = await Promise.all([
        searchUsersApi(query),
        searchPostsApi(query),
        searchReelsApi(query),
        searchHashtagsApi(query),
      ]);

      return {
        users: users || [],
        posts: posts || [],
        reels: reels || [],
        hashtags: hashtags || [],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  },
);

export const fetchTrendingContent = createAsyncThunk(
  "search/fetchTrendingContent",
  async (_, { rejectWithValue }) => {
    try {
      return await getTrendingContentApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trending content",
      );
    }
  },
);

const initialState = {
  query: "",
  users: [],
  posts: [],
  reels: [],
  hashtags: [],
  trending: {
    posts: [],
    reels: [],
  },
  recentSearches: JSON.parse(localStorage.getItem("recentSearches") || "[]"),
  loading: false,
  trendingLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },

    clearSearchResults: (state) => {
      state.query = "";
      state.users = [];
      state.posts = [];
      state.reels = [];
      state.hashtags = [];
      state.error = null;
    },

    addRecentSearch: (state, action) => {
      const searchValue = action.payload.trim();

      if (!searchValue) return;

      const updatedSearches = [
        searchValue,
        ...state.recentSearches.filter((item) => item !== searchValue),
      ].slice(0, 10);

      state.recentSearches = updatedSearches;

      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem("recentSearches");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.posts = action.payload.posts;
        state.reels = action.payload.reels;
        state.hashtags = action.payload.hashtags;
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTrendingContent.pending, (state) => {
        state.trendingLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingContent.fulfilled, (state, action) => {
        state.trendingLoading = false;

        state.trending = {
          posts: action.payload?.posts || [],
          reels: action.payload?.reels || [],
        };
      })
      .addCase(fetchTrendingContent.rejected, (state, action) => {
        state.trendingLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addRecentSearch,
  clearRecentSearches,
  clearSearchResults,
  setSearchQuery,
} = searchSlice.actions;

export default searchSlice.reducer;

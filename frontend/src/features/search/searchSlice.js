import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  clearSearchHistoryApi,
  getSearchHistoryApi,
  getTrendingContentApi,
  saveSearchHistoryApi,
  searchHashtagsApi,
  searchPostsApi,
  searchReelsApi,
  searchUsersApi,
} from "./searchService";

const recentSearchesStorageKey = "recentSearches";

const getStoredRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(recentSearchesStorageKey) || "[]");
  } catch {
    return [];
  }
};

const getRecentSearchEntry = (item) => {
  if (typeof item === "string") {
    const value = item.trim();

    return value
      ? {
          type: "text",
          value,
          label: value,
        }
      : null;
  }

  if (!item) return null;

  const user = item.user || item.searchedUser;

  if ((item.type === "user" || item.searchType === "user") && user?.username) {
    return {
      type: "user",
      value: user.username.trim(),
      label: user.username.trim(),
      subtitle: user.fullName || "pixelFeed user",
      user,
      historyId: item.historyId || item._id,
    };
  }

  if (item.type && item.value) {
    const value = String(item.value).trim();

    return value
      ? {
          ...item,
          value,
          label: item.label || value,
        }
      : null;
  }

  if (item.hashtag) {
    const value = item.hashtag.trim();

    return value
      ? {
          type: "hashtag",
          value,
          label: `#${value}`,
          historyId: item._id,
        }
      : null;
  }

  const value = item.query?.trim() || "";

  if (!value) return null;

  return {
    type: item.searchType === "hashtag" ? "hashtag" : "text",
    value,
    label: item.searchType === "hashtag" ? `#${value}` : value,
    historyId: item._id,
  };
};

const getHistorySearchValue = (item) => {
  return getRecentSearchEntry(item)?.value || "";
};

const normalizeRecentSearches = (items = []) => {
  const seenSearches = new Set();
  const searches = [];
  const entries = items.map(getRecentSearchEntry).filter(Boolean);
  const userValues = new Set(
    entries
      .filter((entry) => entry.type === "user")
      .map((entry) => entry.value.toLowerCase()),
  );

  entries.forEach((entry) => {
    const valueKey = entry.value.toLowerCase();
    const dedupeKey =
      entry.type === "user" && entry.user?._id
        ? `user:${entry.user._id}`
        : `${entry.type}:${valueKey}`;

    if (
      !entry.value ||
      seenSearches.has(dedupeKey) ||
      (entry.type === "text" && userValues.has(valueKey))
    ) {
      return;
    }

    seenSearches.add(dedupeKey);
    searches.push({
      ...entry,
      key: dedupeKey,
    });
  });

  return searches.slice(0, 10);
};

const persistRecentSearches = (searches) => {
  localStorage.setItem(recentSearchesStorageKey, JSON.stringify(searches));
};

const addRecentSearchValue = (recentSearches, value) => {
  return normalizeRecentSearches([value, ...recentSearches]);
};

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

export const fetchSearchHistory = createAsyncThunk(
  "search/fetchSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await getSearchHistoryApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch search history",
      );
    }
  },
);

export const saveSearchHistory = createAsyncThunk(
  "search/saveSearchHistory",
  async (query, { rejectWithValue }) => {
    try {
      return await saveSearchHistoryApi(query);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save search history",
      );
    }
  },
);

export const clearSearchHistory = createAsyncThunk(
  "search/clearSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      await clearSearchHistoryApi();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear search history",
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
  recentSearches: normalizeRecentSearches(getStoredRecentSearches()),
  loading: false,
  trendingLoading: false,
  historyLoading: false,
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
      const updatedSearches = addRecentSearchValue(
        state.recentSearches,
        action.payload,
      );

      state.recentSearches = updatedSearches;
      persistRecentSearches(updatedSearches);
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem(recentSearchesStorageKey);
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

        const updatedSearches = addRecentSearchValue(
          state.recentSearches,
          action.meta.arg,
        );

        state.recentSearches = updatedSearches;
        persistRecentSearches(updatedSearches);
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
      })

      .addCase(fetchSearchHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.historyLoading = false;

        const updatedSearches = normalizeRecentSearches([
          ...(action.payload || []),
          ...state.recentSearches,
        ]);

        state.recentSearches = updatedSearches;
        persistRecentSearches(updatedSearches);
      })
      .addCase(fetchSearchHistory.rejected, (state) => {
        state.historyLoading = false;
      })

      .addCase(saveSearchHistory.fulfilled, (state, action) => {
        const updatedSearches = addRecentSearchValue(
          state.recentSearches,
          action.payload || getHistorySearchValue(action.meta.arg),
        );

        state.recentSearches = updatedSearches;
        persistRecentSearches(updatedSearches);
      })

      .addCase(clearSearchHistory.fulfilled, (state) => {
        state.recentSearches = [];
        localStorage.removeItem(recentSearchesStorageKey);
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

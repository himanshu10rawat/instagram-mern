import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  addStoryToHighlightApi,
  createHighlightApi,
  deleteHighlightApi,
  getArchivedStoriesApi,
  getMyHighlightsApi,
  getUserHighlightsApi,
  removeStoryFromHighlightApi,
  updateHighlightApi,
} from "./highlightService";

const upsertHighlight = (highlights, updatedHighlight) => {
  const exists = highlights.some(
    (highlight) => highlight._id === updatedHighlight._id,
  );

  if (!exists) {
    return [updatedHighlight, ...highlights];
  }

  return highlights.map((highlight) =>
    highlight._id === updatedHighlight._id ? updatedHighlight : highlight,
  );
};

export const fetchMyHighlights = createAsyncThunk(
  "highlights/fetchMyHighlights",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyHighlightsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch highlights",
      );
    }
  },
);

export const fetchUserHighlights = createAsyncThunk(
  "highlights/fetchUserHighlights",
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserHighlightsApi(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user highlights",
      );
    }
  },
);

export const fetchArchivedStories = createAsyncThunk(
  "highlights/fetchArchivedStories",
  async (_, { rejectWithValue }) => {
    try {
      return await getArchivedStoriesApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch archived stories",
      );
    }
  },
);

export const createHighlight = createAsyncThunk(
  "highlights/createHighlight",
  async (payload, { rejectWithValue }) => {
    try {
      return await createHighlightApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create highlight",
      );
    }
  },
);

export const updateHighlight = createAsyncThunk(
  "highlights/updateHighlight",
  async (payload, { rejectWithValue }) => {
    try {
      return await updateHighlightApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update highlight",
      );
    }
  },
);

export const deleteHighlight = createAsyncThunk(
  "highlights/deleteHighlight",
  async (highlightId, { rejectWithValue }) => {
    try {
      await deleteHighlightApi(highlightId);
      return highlightId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete highlight",
      );
    }
  },
);

export const addStoryToHighlight = createAsyncThunk(
  "highlights/addStoryToHighlight",
  async (payload, { rejectWithValue }) => {
    try {
      return await addStoryToHighlightApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add story to highlight",
      );
    }
  },
);

export const removeStoryFromHighlight = createAsyncThunk(
  "highlights/removeStoryFromHighlight",
  async (payload, { rejectWithValue }) => {
    try {
      return await removeStoryFromHighlightApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to remove story from highlight",
      );
    }
  },
);

const initialState = {
  highlights: [],
  archivedStories: [],
  loading: false,
  archiveLoading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const highlightSlice = createSlice({
  name: "highlights",
  initialState,
  reducers: {
    clearHighlightStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    resetHighlights: (state) => {
      state.highlights = [];
      state.archivedStories = [];
      state.loading = false;
      state.archiveLoading = false;
      state.actionLoading = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyHighlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyHighlights.fulfilled, (state, action) => {
        state.loading = false;
        state.highlights = action.payload || [];
      })
      .addCase(fetchMyHighlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserHighlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserHighlights.fulfilled, (state, action) => {
        state.loading = false;
        state.highlights = action.payload || [];
      })
      .addCase(fetchUserHighlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchArchivedStories.pending, (state) => {
        state.archiveLoading = true;
        state.error = null;
      })
      .addCase(fetchArchivedStories.fulfilled, (state, action) => {
        state.archiveLoading = false;
        state.archivedStories = action.payload || [];
      })
      .addCase(fetchArchivedStories.rejected, (state, action) => {
        state.archiveLoading = false;
        state.error = action.payload;
      })

      .addCase(createHighlight.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createHighlight.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.highlights = upsertHighlight(state.highlights, action.payload);
        state.successMessage = "Highlight created successfully";
      })
      .addCase(createHighlight.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(updateHighlight.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateHighlight.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.highlights = upsertHighlight(state.highlights, action.payload);
        state.successMessage = "Highlight updated successfully";
      })
      .addCase(updateHighlight.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteHighlight.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteHighlight.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.highlights = state.highlights.filter(
          (highlight) => highlight._id !== action.payload,
        );
        state.successMessage = "Highlight deleted successfully";
      })
      .addCase(deleteHighlight.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(addStoryToHighlight.fulfilled, (state, action) => {
        state.highlights = upsertHighlight(state.highlights, action.payload);
      })

      .addCase(removeStoryFromHighlight.fulfilled, (state, action) => {
        state.highlights = upsertHighlight(state.highlights, action.payload);
      });
  },
});

export const { clearHighlightStatus, resetHighlights } = highlightSlice.actions;

export default highlightSlice.reducer;

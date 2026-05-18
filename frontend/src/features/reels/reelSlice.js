import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  commentReelApi,
  getReelsApi,
  getSingleReelApi,
  likeReelApi,
  saveReelApi,
} from "./reelService";

export const fetchReels = createAsyncThunk(
  "reels/fetchReels",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await getReelsApi({ page, limit });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reels",
      );
    }
  },
);

export const fetchSingleReel = createAsyncThunk(
  "reels/fetchSingleReel",
  async (reelId, { rejectWithValue }) => {
    try {
      return await getSingleReelApi(reelId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reel",
      );
    }
  },
);

export const likeReel = createAsyncThunk(
  "reels/likeReel",
  async (payload, { rejectWithValue }) => {
    try {
      const { reelId, isLiked = false } =
        typeof payload === "string" ? { reelId: payload } : payload;

      return await likeReelApi(reelId, isLiked);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to like reel",
      );
    }
  },
);

export const saveReel = createAsyncThunk(
  "reels/saveReel",
  async (payload, { rejectWithValue }) => {
    try {
      const { reelId, isSaved = false } =
        typeof payload === "string" ? { reelId: payload } : payload;

      return await saveReelApi(reelId, isSaved);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save reel",
      );
    }
  },
);

export const commentReel = createAsyncThunk(
  "reels/commentReel",
  async ({ reelId, text }, { rejectWithValue }) => {
    try {
      return await commentReelApi({ reelId, text });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to comment reel",
      );
    }
  },
);

const updateReelInList = (reels, updatedReel) =>
  reels.map((reel) => (reel._id === updatedReel._id ? updatedReel : reel));

const addCommentToReel = (reel, comment) => {
  if (!reel || !comment) return reel;

  return {
    ...reel,
    comments: [...(reel.comments || []), comment],
    commentsCount: (reel.commentsCount || 0) + 1,
  };
};

const initialState = {
  reels: [],
  currentReel: null,
  page: 1,
  hasMore: true,
  loading: false,
  actionLoading: false,
  error: null,
};

const reelSlice = createSlice({
  name: "reels",
  initialState,
  reducers: {
    resetReels: (state) => {
      state.reels = [];
      state.currentReel = null;
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },
    clearReelError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.loading = false;

        const newReels = action.payload?.reels || [];
        const pagination = action.payload?.pagination || {};

        if ((pagination.page || 1) === 1) {
          state.reels = newReels;
        } else {
          state.reels = [...state.reels, ...newReels];
        }

        state.page = pagination.page || 1;
        state.hasMore = Boolean(pagination.hasMore);
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSingleReel.fulfilled, (state, action) => {
        state.currentReel = action.payload;
      })

      .addCase(likeReel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(likeReel.fulfilled, (state, action) => {
        state.actionLoading = false;

        if (!action.payload?._id) return;

        state.reels = updateReelInList(state.reels, action.payload);

        if (state.currentReel?._id === action.payload._id) {
          state.currentReel = action.payload;
        }
      })
      .addCase(likeReel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(saveReel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(saveReel.fulfilled, (state, action) => {
        state.actionLoading = false;

        if (!action.payload?._id) return;

        state.reels = updateReelInList(state.reels, action.payload);

        if (state.currentReel?._id === action.payload._id) {
          state.currentReel = action.payload;
        }
      })
      .addCase(saveReel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(commentReel.fulfilled, (state, action) => {
        const newComment = action.payload;
        const reelId = newComment?.reel || action.meta.arg.reelId;

        state.reels = state.reels.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                commentsCount: (reel.commentsCount || 0) + 1,
              }
            : reel,
        );

        if (state.currentReel?._id === reelId) {
          state.currentReel = addCommentToReel(state.currentReel, newComment);
        }
      });
  },
});

export const { clearReelError, resetReels } = reelSlice.actions;

export default reelSlice.reducer;

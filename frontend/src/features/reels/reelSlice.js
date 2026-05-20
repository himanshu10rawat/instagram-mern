import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  commentReelApi,
  getReelCommentsApi,
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
  async ({ reelId, text, parentComment }, { rejectWithValue }) => {
    try {
      return await commentReelApi({ reelId, text, parentComment });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to comment reel",
      );
    }
  },
);

export const fetchReelComments = createAsyncThunk(
  "reels/fetchReelComments",
  async (reelId, { rejectWithValue }) => {
    try {
      return {
        reelId,
        comments: await getReelCommentsApi(reelId),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reel comments",
      );
    }
  },
);

const preserveReelComments = (existingReel, updatedReel) => {
  if (!Array.isArray(existingReel?.comments) || Array.isArray(updatedReel?.comments)) {
    return updatedReel;
  }

  return {
    ...updatedReel,
    comments: existingReel.comments,
  };
};

const updateReelInList = (reels, updatedReel) =>
  reels.map((reel) =>
    reel._id === updatedReel._id ? preserveReelComments(reel, updatedReel) : reel,
  );

const appendCommentToThread = (comments = [], newComment) =>
  comments.map((comment) => {
    if (comment._id === newComment.parentComment) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newComment],
      };
    }

    return {
      ...comment,
      replies: appendCommentToThread(comment.replies || [], newComment),
    };
  });

const addCommentToReel = (reel, comment) => {
  if (!reel || !comment) return reel;

  const hasLoadedComments = Array.isArray(reel.comments);
  const nextReel = {
    ...reel,
    commentsCount: (reel.commentsCount || 0) + 1,
  };

  if (!hasLoadedComments) {
    return nextReel;
  }

  return {
    ...nextReel,
    comments: comment.parentComment
      ? appendCommentToThread(reel.comments, comment)
      : [comment, ...reel.comments],
  };
};

const initialState = {
  reels: [],
  currentReel: null,
  page: 1,
  hasMore: true,
  loading: false,
  actionLoading: false,
  commentsLoading: false,
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
      state.commentsLoading = false;
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

      .addCase(fetchSingleReel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleReel.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReel = action.payload;
      })
      .addCase(fetchSingleReel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchReelComments.pending, (state) => {
        state.commentsLoading = true;
        state.error = null;
      })
      .addCase(fetchReelComments.fulfilled, (state, action) => {
        state.commentsLoading = false;

        const { reelId, comments } = action.payload;

        state.reels = state.reels.map((reel) =>
          reel._id === reelId ? { ...reel, comments } : reel,
        );

        if (state.currentReel?._id === reelId) {
          state.currentReel = {
            ...state.currentReel,
            comments,
          };
        }
      })
      .addCase(fetchReelComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = action.payload;
      })

      .addCase(likeReel.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(likeReel.fulfilled, (state, action) => {
        state.actionLoading = false;

        if (!action.payload?._id) return;

        state.reels = updateReelInList(state.reels, action.payload);

        if (state.currentReel?._id === action.payload._id) {
          state.currentReel = preserveReelComments(
            state.currentReel,
            action.payload,
          );
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
          state.currentReel = preserveReelComments(
            state.currentReel,
            action.payload,
          );
        }
      })
      .addCase(saveReel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(commentReel.fulfilled, (state, action) => {
        state.actionLoading = false;

        const newComment = action.payload;
        const reelId = newComment?.reel || action.meta.arg.reelId;

        state.reels = state.reels.map((reel) =>
          reel._id === reelId ? addCommentToReel(reel, newComment) : reel,
        );

        if (state.currentReel?._id === reelId) {
          state.currentReel = addCommentToReel(state.currentReel, newComment);
        }
      })
      .addCase(commentReel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(commentReel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReelError, resetReels } = reelSlice.actions;

export default reelSlice.reducer;

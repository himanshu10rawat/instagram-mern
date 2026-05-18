import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getSingleStoryApi,
  getStoriesFeedApi,
  likeStoryApi,
  markStoryViewedApi,
  replyStoryApi,
} from "./storyService";

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

export const fetchSingleStory = createAsyncThunk(
  "stories/fetchSingleStory",
  async (storyId, { rejectWithValue }) => {
    try {
      return await getSingleStoryApi(storyId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch story",
      );
    }
  },
);

export const markStoryViewed = createAsyncThunk(
  "stories/markStoryViewed",
  async (storyId, { rejectWithValue }) => {
    try {
      return await markStoryViewedApi(storyId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark story viewed",
      );
    }
  },
);

export const likeStory = createAsyncThunk(
  "stories/likeStory",
  async (payload, { rejectWithValue }) => {
    try {
      const { storyId, isLiked = false } =
        typeof payload === "string" ? { storyId: payload } : payload;

      return await likeStoryApi(storyId, isLiked);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to like story",
      );
    }
  },
);

export const replyStory = createAsyncThunk(
  "stories/replyStory",
  async ({ storyId, text }, { rejectWithValue }) => {
    try {
      return await replyStoryApi({ storyId, text });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reply story",
      );
    }
  },
);

const replaceStoryById = (stories, updatedStory) =>
  stories.map((storyGroup) => ({
    ...storyGroup,
    stories: storyGroup.stories?.map((story) =>
      story._id === updatedStory._id ? updatedStory : story,
    ),
  }));

const normalizeStoryGroups = (payload = []) => {
  if (!Array.isArray(payload)) return [];

  const validItems = payload.filter(Boolean);
  const alreadyGrouped = validItems.every((item) =>
    Array.isArray(item?.stories),
  );

  if (alreadyGrouped) {
    return validItems
      .map((group) => ({
        ...group,
        stories: (group.stories || []).filter(Boolean),
      }))
      .filter((group) => group.stories.length > 0);
  }

  const groupedStories = new Map();

  validItems.forEach((story) => {
    const author = story.author || story.user;
    const authorId = author?._id || story.author;

    if (!authorId) return;

    const existingGroup = groupedStories.get(authorId) || {
      user: author,
      stories: [],
    };

    existingGroup.stories.push(story);
    groupedStories.set(authorId, existingGroup);
  });

  return [...groupedStories.values()];
};

const initialState = {
  storyGroups: [],
  currentStory: null,
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const storySlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },

    clearStoryStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoriesFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoriesFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.storyGroups = normalizeStoryGroups(action.payload);
      })
      .addCase(fetchStoriesFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSingleStory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleStory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStory = action.payload;
      })
      .addCase(fetchSingleStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(likeStory.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(likeStory.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedStory = action.payload;

        if (!updatedStory?._id) return;

        state.storyGroups = replaceStoryById(state.storyGroups, updatedStory);

        if (state.currentStory?._id === updatedStory._id) {
          state.currentStory = updatedStory;
        }
      })
      .addCase(likeStory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(replyStory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(replyStory.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = "Reply sent successfully";
      })
      .addCase(replyStory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(markStoryViewed.fulfilled, (state, action) => {
        const updatedStory = action.payload;

        if (!updatedStory?._id) return;

        state.storyGroups = replaceStoryById(state.storyGroups, updatedStory);

        if (state.currentStory?._id === updatedStory._id) {
          state.currentStory = updatedStory;
        }
      });
  },
});

export const { clearCurrentStory, clearStoryStatus } = storySlice.actions;

export default storySlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getSingleStoryApi,
  getStoryEngagementApi,
  getStoriesFeedApi,
  getUserStoriesApi,
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
  {
    condition: (arg, { getState }) => {
      const { stories } = getState();

      if (arg?.force) return true;
      if (
        stories.storyGroups.length > 0 &&
        Date.now() - stories.lastFetched < 30000
      ) {
        return false;
      }

      return !stories.loading;
    },
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

export const fetchUserStories = createAsyncThunk(
  "stories/fetchUserStories",
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserStoriesApi(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user stories",
      );
    }
  },
);

export const fetchStoryEngagement = createAsyncThunk(
  "stories/fetchStoryEngagement",
  async (storyId, { rejectWithValue }) => {
    try {
      return {
        storyId,
        engagement: await getStoryEngagementApi(storyId),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch story engagement",
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

const getStoryTime = (story) => Date.parse(story?.createdAt || "") || 0;

const sortStoriesAscending = (stories = []) =>
  [...stories].filter(Boolean).sort((first, second) => {
    return getStoryTime(first) - getStoryTime(second);
  });

const getGroupLatestStoryTime = (group) =>
  Math.max(...(group.stories || []).map(getStoryTime), 0);

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
        stories: sortStoriesAscending(group.stories || []),
      }))
      .filter((group) => group.stories.length > 0)
      .sort((first, second) => {
        return getGroupLatestStoryTime(second) - getGroupLatestStoryTime(first);
      });
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

  return [...groupedStories.values()]
    .map((group) => ({
      ...group,
      stories: sortStoriesAscending(group.stories),
    }))
    .sort((first, second) => {
      return getGroupLatestStoryTime(second) - getGroupLatestStoryTime(first);
    });
};

const initialState = {
  storyGroups: [],
  currentStory: null,
  viewerAuthorId: null,
  viewerStories: [],
  storyEngagementById: {},
  lastFetched: 0,
  loading: false,
  actionLoading: false,
  engagementLoading: false,
  error: null,
  successMessage: "",
};

const storySlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    clearCurrentStory: (state) => {
      state.currentStory = null;
      state.viewerAuthorId = null;
      state.viewerStories = [];
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
        state.lastFetched = Date.now();
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

        if (action.payload?._id) {
          state.storyGroups = replaceStoryById(
            state.storyGroups,
            action.payload,
          );
        }
      })
      .addCase(fetchSingleStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserStories.fulfilled, (state, action) => {
        const stories = sortStoriesAscending(action.payload || []);
        const authorId =
          stories[0]?.author?._id || stories[0]?.author || action.meta.arg;

        state.viewerStories = stories;
        state.viewerAuthorId = authorId || null;

        if (authorId) {
          const existingGroupIndex = state.storyGroups.findIndex((group) => {
            const groupUser = group.user || group.author || group.stories?.[0]?.author;
            const groupUserId = groupUser?._id || groupUser;

            return groupUserId === authorId;
          });
          const nextGroup = {
            user: stories[0]?.author,
            stories,
          };

          if (existingGroupIndex === -1) {
            state.storyGroups = normalizeStoryGroups([
              ...state.storyGroups,
              nextGroup,
            ]);
          } else {
            state.storyGroups[existingGroupIndex] = {
              ...state.storyGroups[existingGroupIndex],
              ...nextGroup,
            };
            state.storyGroups = normalizeStoryGroups(state.storyGroups);
          }
        }
      })

      .addCase(fetchStoryEngagement.pending, (state) => {
        state.engagementLoading = true;
      })
      .addCase(fetchStoryEngagement.fulfilled, (state, action) => {
        state.engagementLoading = false;

        if (!action.payload?.storyId) return;

        state.storyEngagementById[action.payload.storyId] =
          action.payload.engagement || {
            viewers: [],
            likes: [],
          };
      })
      .addCase(fetchStoryEngagement.rejected, (state, action) => {
        state.engagementLoading = false;
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

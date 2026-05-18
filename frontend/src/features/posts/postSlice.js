import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  archivePostApi,
  commentPostApi,
  deletePostApi,
  getArchivedPostsApi,
  getFeedPostsApi,
  getSavedPostsApi,
  getSinglePostApi,
  likePostApi,
  savePostApi,
  unarchivePostApi,
  updatePostCaptionApi,
} from "./postService";

export const fetchSinglePost = createAsyncThunk(
  "posts/fetchSinglePost",
  async (postId, { rejectWithValue }) => {
    try {
      return await getSinglePostApi(postId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post",
      );
    }
  },
);

export const commentPost = createAsyncThunk(
  "posts/commentPost",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      return await commentPostApi({ postId, text });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to comment post",
      );
    }
  },
);

export const fetchFeedPosts = createAsyncThunk(
  "posts/fetchFeedPosts",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await getFeedPostsApi({ page, limit });
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

export const fetchSavedPosts = createAsyncThunk(
  "posts/fetchSavedPosts",
  async (_, { rejectWithValue }) => {
    try {
      return await getSavedPostsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch saved posts",
      );
    }
  },
);

export const fetchArchivedPosts = createAsyncThunk(
  "posts/fetchArchivedPosts",
  async (_, { rejectWithValue }) => {
    try {
      return await getArchivedPostsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch archived posts",
      );
    }
  },
);

export const archivePost = createAsyncThunk(
  "posts/archivePost",
  async (postId, { rejectWithValue }) => {
    try {
      return await archivePostApi(postId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to archive post",
      );
    }
  },
);

export const unarchivePost = createAsyncThunk(
  "posts/unarchivePost",
  async (postId, { rejectWithValue }) => {
    try {
      return await unarchivePostApi(postId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unarchive post",
      );
    }
  },
);

export const updatePostCaption = createAsyncThunk(
  "posts/updatePostCaption",
  async ({ postId, caption }, { rejectWithValue }) => {
    try {
      return await updatePostCaptionApi({ postId, caption });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update caption",
      );
    }
  },
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await deletePostApi(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post",
      );
    }
  },
);

const initialState = {
  posts: [],
  savedPosts: [],
  archivedPosts: [],
  currentPost: null,
  page: 1,
  hasMore: true,
  loading: false,
  actionLoading: false,
  error: null,
};

const replacePostById = (posts, updatedPost) => {
  if (!updatedPost?._id) return posts;

  return posts.map((post) =>
    post._id === updatedPost._id ? updatedPost : post,
  );
};

const appendCommentToPost = (post, comment) => {
  if (!post || !comment) return post;

  return {
    ...post,
    comments: [...(post.comments || []), comment],
    commentsCount: (post.commentsCount || 0) + 1,
  };
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
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearSavedPosts: (state) => {
      state.savedPosts = [];
    },
    clearArchivedPosts: (state) => {
      state.archivedPosts = [];
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
        const updatedPost = action.payload;

        if (!updatedPost?._id) return;

        state.posts = replacePostById(state.posts, updatedPost);
        state.savedPosts = replacePostById(state.savedPosts, updatedPost);
        state.archivedPosts = replacePostById(state.archivedPosts, updatedPost);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      .addCase(savePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        if (!updatedPost?._id) return;

        state.posts = replacePostById(state.posts, updatedPost);
        state.savedPosts = replacePostById(state.savedPosts, updatedPost);
        state.archivedPosts = replacePostById(state.archivedPosts, updatedPost);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      .addCase(fetchSinglePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchSinglePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(commentPost.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        state.actionLoading = false;

        const newComment = action.payload;
        const postId = newComment?.post || action.meta.arg.postId;

        state.posts = state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                commentsCount: (post.commentsCount || 0) + 1,
              }
            : post,
        );

        if (state.currentPost?._id === postId) {
          state.currentPost = appendCommentToPost(state.currentPost, newComment);
        }
      })
      .addCase(commentPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSavedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload || [];
      })
      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchArchivedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArchivedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.archivedPosts = action.payload || [];
      })
      .addCase(fetchArchivedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(archivePost.fulfilled, (state, action) => {
        const archivedPost = action.payload;

        if (!archivedPost?._id) return;

        state.posts = state.posts.filter(
          (post) => post._id !== archivedPost._id,
        );

        if (
          !state.archivedPosts.some((post) => post._id === archivedPost._id)
        ) {
          state.archivedPosts.unshift(archivedPost);
        }

        if (state.currentPost?._id === archivedPost._id) {
          state.currentPost = archivedPost;
        }
      })

      .addCase(unarchivePost.fulfilled, (state, action) => {
        const unarchivedPost = action.payload;

        if (!unarchivedPost?._id) return;

        state.archivedPosts = state.archivedPosts.filter(
          (post) => post._id !== unarchivedPost._id,
        );

        if (state.currentPost?._id === unarchivedPost._id) {
          state.currentPost = unarchivedPost;
        }
      })

      .addCase(updatePostCaption.fulfilled, (state, action) => {
        const updatedPost = action.payload;

        state.posts = replacePostById(state.posts, updatedPost);
        state.savedPosts = replacePostById(state.savedPosts, updatedPost);
        state.archivedPosts = replacePostById(state.archivedPosts, updatedPost);

        if (state.currentPost?._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;

        state.posts = state.posts.filter((post) => post._id !== postId);
        state.savedPosts = state.savedPosts.filter(
          (post) => post._id !== postId,
        );
        state.archivedPosts = state.archivedPosts.filter(
          (post) => post._id !== postId,
        );

        if (state.currentPost?._id === postId) {
          state.currentPost = null;
        }
      });
  },
});

export const {
  clearArchivedPosts,
  clearCurrentPost,
  clearPostError,
  clearSavedPosts,
  resetFeed,
} = postSlice.actions;

export default postSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  addPostToCollectionApi,
  createCollectionApi,
  deleteCollectionApi,
  getCollectionByIdApi,
  getCollectionsApi,
  removePostFromCollectionApi,
  updateCollectionApi,
} from "./collectionService";

const upsertCollection = (collections, updatedCollection) => {
  const exists = collections.some(
    (collection) => collection._id === updatedCollection._id,
  );

  if (!exists) {
    return [updatedCollection, ...collections];
  }

  return collections.map((collection) =>
    collection._id === updatedCollection._id ? updatedCollection : collection,
  );
};

export const fetchCollections = createAsyncThunk(
  "collections/fetchCollections",
  async (_, { rejectWithValue }) => {
    try {
      return await getCollectionsApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch collections",
      );
    }
  },
);

export const fetchCollectionById = createAsyncThunk(
  "collections/fetchCollectionById",
  async (collectionId, { rejectWithValue }) => {
    try {
      return await getCollectionByIdApi(collectionId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch collection",
      );
    }
  },
);

export const createCollection = createAsyncThunk(
  "collections/createCollection",
  async (payload, { rejectWithValue }) => {
    try {
      return await createCollectionApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create collection",
      );
    }
  },
);

export const updateCollection = createAsyncThunk(
  "collections/updateCollection",
  async (payload, { rejectWithValue }) => {
    try {
      return await updateCollectionApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update collection",
      );
    }
  },
);

export const deleteCollection = createAsyncThunk(
  "collections/deleteCollection",
  async (collectionId, { rejectWithValue }) => {
    try {
      await deleteCollectionApi(collectionId);
      return collectionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete collection",
      );
    }
  },
);

export const addPostToCollection = createAsyncThunk(
  "collections/addPostToCollection",
  async (payload, { rejectWithValue }) => {
    try {
      return await addPostToCollectionApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add post to collection",
      );
    }
  },
);

export const removePostFromCollection = createAsyncThunk(
  "collections/removePostFromCollection",
  async (payload, { rejectWithValue }) => {
    try {
      return await removePostFromCollectionApi(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to remove post from collection",
      );
    }
  },
);

const initialState = {
  collections: [],
  currentCollection: null,
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: "",
};

const collectionSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    clearCollectionStatus: (state) => {
      state.error = null;
      state.successMessage = "";
    },

    resetCurrentCollection: (state) => {
      state.currentCollection = null;
      state.error = null;
    },

    resetCollections: (state) => {
      state.collections = [];
      state.currentCollection = null;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload || [];
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCollectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCollection = action.payload;
      })
      .addCase(fetchCollectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCollection.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.collections = upsertCollection(state.collections, action.payload);
        state.successMessage = "Collection created successfully";
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCollection.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.collections = upsertCollection(state.collections, action.payload);
        state.currentCollection = action.payload;
        state.successMessage = "Collection updated successfully";
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteCollection.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.collections = state.collections.filter(
          (collection) => collection._id !== action.payload,
        );
        state.currentCollection = null;
        state.successMessage = "Collection deleted successfully";
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(addPostToCollection.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addPostToCollection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.collections = upsertCollection(state.collections, action.payload);
        state.successMessage = "Post added to collection";
      })
      .addCase(addPostToCollection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      .addCase(removePostFromCollection.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removePostFromCollection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentCollection = action.payload;
        state.collections = upsertCollection(state.collections, action.payload);
        state.successMessage = "Post removed from collection";
      })
      .addCase(removePostFromCollection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCollectionStatus,
  resetCollections,
  resetCurrentCollection,
} = collectionSlice.actions;

export default collectionSlice.reducer;

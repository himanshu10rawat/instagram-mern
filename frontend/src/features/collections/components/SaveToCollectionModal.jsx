import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addPostToCollection,
  clearCollectionStatus,
  fetchCollections,
} from "../collectionSlice";
import CollectionFormModal from "./CollectionFormModal";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const SaveToCollectionContent = ({ onClose, postId }) => {
  const dispatch = useDispatch();

  const { collections, loading, actionLoading, error, successMessage } =
    useSelector((state) => state.collections);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addedCollectionIds, setAddedCollectionIds] = useState([]);

  useEffect(() => {
    dispatch(fetchCollections());
    dispatch(clearCollectionStatus());
  }, [dispatch]);

  const handleAddToCollection = async (collectionId) => {
    if (!collectionId || !postId) return;

    const result = await dispatch(
      addPostToCollection({
        collectionId,
        postId,
      }),
    );

    if (addPostToCollection.fulfilled.match(result)) {
      setAddedCollectionIds((prev) => [...prev, collectionId]);
    }
  };

  const isPostAlreadyInCollection = (collection) => {
    return collection.posts?.some((post) => getId(post) === postId);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Save to Collection
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Close save to collection modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              <Plus size={18} />
              Create new collection
            </button>

            {error ? (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {successMessage}
              </div>
            ) : null}

            {loading ? (
              <p className="text-sm text-slate-500">Loading collections...</p>
            ) : null}

            {!loading && collections.length === 0 ? (
              <p className="text-center text-sm text-slate-500">
                No collections yet. Create your first collection.
              </p>
            ) : null}

            <div className="max-h-80 space-y-3 overflow-y-auto">
              {collections.map((collection) => {
                const alreadySaved =
                  isPostAlreadyInCollection(collection) ||
                  addedCollectionIds.includes(collection._id);

                return (
                  <div
                    key={collection._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {collection.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {collection.posts?.length || 0} posts
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCollection(collection._id)}
                      disabled={actionLoading || alreadySaved}
                      className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                      {alreadySaved ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CollectionFormModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          dispatch(fetchCollections());
        }}
      />
    </>
  );
};

const SaveToCollectionModal = ({ open, onClose, postId }) => {
  if (!open) {
    return null;
  }

  return (
    <SaveToCollectionContent
      key={postId || "save-to-collection"}
      onClose={onClose}
      postId={postId}
    />
  );
};

export default SaveToCollectionModal;

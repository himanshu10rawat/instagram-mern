import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addPostToCollection,
  clearCollectionStatus,
  fetchCollections,
} from "../collectionSlice";
import EmptyState from "../../../components/ui/EmptyState";
import ModalShell from "../../../components/ui/ModalShell";
import { ListSkeleton } from "../../../components/ui/Skeleton";
import CollectionFormModal from "./CollectionFormModal";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const getCollectionPosts = (collection) => {
  if (collection.posts?.length) {
    return collection.posts;
  }

  return (collection.items || [])
    .map((item) => item.post)
    .filter(Boolean);
};

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
    return getCollectionPosts(collection).some((post) => getId(post) === postId);
  };

  return (
    <>
      <ModalShell
        title="Save to Collection"
        onClose={onClose}
        className="max-w-md"
      >
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
            <ListSkeleton count={4} withActions />
          ) : null}

          {!loading && collections.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No collections yet"
              description="Create your first collection to organize saved posts."
              variant="inline"
              size="sm"
            />
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
                      {getCollectionPosts(collection).length} posts
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
      </ModalShell>

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

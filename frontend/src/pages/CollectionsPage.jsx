import { Folder, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import EmptyState from "../components/ui/EmptyState";
import { GridSkeleton } from "../components/ui/Skeleton";
import CollectionFormModal from "../features/collections/components/CollectionFormModal";
import {
  fetchCollections,
  resetCollections,
} from "../features/collections/collectionSlice";

const getCollectionPosts = (collection) => {
  if (collection.posts?.length) {
    return collection.posts;
  }

  return (collection.items || [])
    .map((item) => item.post)
    .filter(Boolean);
};

const getCollectionCover = (collection) => {
  const firstPost = getCollectionPosts(collection)[0];
  const firstMedia = firstPost?.media?.[0];

  return (
    firstMedia?.thumbnailUrl ||
    firstMedia?.optimizedUrl ||
    firstMedia?.url ||
    ""
  );
};

const CollectionsPage = () => {
  const dispatch = useDispatch();

  const { collections, loading, error } = useSelector(
    (state) => state.collections,
  );

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCollections());

    return () => {
      dispatch(resetCollections());
    };
  }, [dispatch]);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Collections
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize your saved posts into folders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          <Plus size={18} />
          New Collection
        </button>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <GridSkeleton count={6} />
      ) : null}

      {!loading && collections.length === 0 ? (
        <EmptyState
          icon={Folder}
          iconTone="blue"
          title="No collections yet"
          description="Create collections to organize saved posts."
        />
      ) : null}

      {!loading && collections.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const cover = getCollectionCover(collection);
            const postsCount = getCollectionPosts(collection).length;

            return (
              <Link
                key={collection._id}
                to={`/collections/${collection._id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-900">
                  {cover ? (
                    <img
                      src={cover}
                      alt={collection.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Folder className="text-slate-400" size={42} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                    {collection.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {postsCount} posts
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      <CollectionFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </section>
  );
};

export default CollectionsPage;

import { Folder, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import CollectionFormModal from "../features/collections/components/CollectionFormModal";
import {
  fetchCollections,
  resetCollections,
} from "../features/collections/collectionSlice";

const getCollectionCover = (collection) => {
  const firstPost = collection.posts?.[0];
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
        <p className="text-sm text-slate-500">Loading collections...</p>
      ) : null}

      {!loading && collections.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <Folder className="mx-auto text-slate-400" size={40} />

          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            No collections yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create collections to organize saved posts.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const cover = getCollectionCover(collection);

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
                  {collection.posts?.length || 0} posts
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <CollectionFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </section>
  );
};

export default CollectionsPage;

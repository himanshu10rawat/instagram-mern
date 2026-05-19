import { Edit3, Folder, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import EmptyState from "../components/ui/EmptyState";
import { GridSkeleton, PageHeaderSkeleton } from "../components/ui/Skeleton";
import CollectionFormModal from "../features/collections/components/CollectionFormModal";
import {
  deleteCollection,
  fetchCollectionById,
  removePostFromCollection,
  resetCurrentCollection,
} from "../features/collections/collectionSlice";

const getCollectionPosts = (collection) => {
  if (collection.posts?.length) {
    return collection.posts;
  }

  return (collection.items || [])
    .map((item) => item.post)
    .filter(Boolean);
};

const getPostMedia = (post) => {
  const media = post.media?.[0];

  return {
    url: media?.thumbnailUrl || media?.optimizedUrl || media?.url,
    type: media?.type || "image",
  };
};

const CollectionDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { collectionId } = useParams();

  const { currentCollection, loading, actionLoading, error } = useSelector(
    (state) => state.collections,
  );

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCollectionById(collectionId));

    return () => {
      dispatch(resetCurrentCollection());
    };
  }, [collectionId, dispatch]);

  const handleDeleteCollection = async () => {
    const confirmed = window.confirm("Delete this collection?");

    if (!confirmed) return;

    const result = await dispatch(deleteCollection(collectionId));

    if (deleteCollection.fulfilled.match(result)) {
      navigate("/collections");
    }
  };

  const handleRemovePost = async (postId) => {
    await dispatch(
      removePostFromCollection({
        collectionId,
        postId,
      }),
    );
  };

  if (loading && !currentCollection) {
    return (
      <section className="mx-auto max-w-5xl space-y-6">
        <PageHeaderSkeleton actions />
        <GridSkeleton count={9} />
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!currentCollection) {
    return null;
  }

  const posts = getCollectionPosts(currentCollection);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            {currentCollection.name}
          </h1>

          {currentCollection.description ? (
            <p className="mt-1 text-sm text-slate-500">
              {currentCollection.description}
            </p>
          ) : null}

          <p className="mt-1 text-xs text-slate-500">{posts.length} posts</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={handleDeleteCollection}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={Folder}
          iconTone="blue"
          title="No posts in this collection"
          description="Save posts to this collection from the feed."
        />
      ) : null}

      <div className="grid grid-cols-3 gap-1 sm:gap-4">
        {posts.map((post) => {
          const media = getPostMedia(post);

          return (
            <div
              key={post._id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900"
            >
              <Link to={`/posts/${post._id}`} className="block h-full w-full">
                {media.type === "video" ? (
                  <video
                    src={media.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={post.caption || "Collection post"}
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>

              <button
                type="button"
                onClick={() => handleRemovePost(post._id)}
                disabled={actionLoading}
                className="absolute right-2 top-2 hidden rounded-full bg-red-600 p-2 text-white group-hover:block disabled:opacity-60"
                aria-label="Remove post from collection"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <CollectionFormModal
        open={showEditModal}
        collection={currentCollection}
        onClose={() => setShowEditModal(false)}
      />
    </section>
  );
};

export default CollectionDetailPage;

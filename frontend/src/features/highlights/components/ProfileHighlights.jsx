import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { StoryTraySkeleton } from "../../../components/ui/Skeleton";
import {
  deleteHighlight,
  fetchArchivedStories,
  fetchMyHighlights,
  fetchUserHighlights,
  resetHighlights,
} from "../highlightSlice";
import CreateHighlightModal from "./CreateHighlightModal";
import HighlightViewerModal from "./HighlightViewerModal";

const getHighlightCover = (highlight) => {
  return (
    highlight.coverImage?.url ||
    highlight.stories?.[0]?.media?.thumbnailUrl ||
    highlight.stories?.[0]?.media?.optimizedUrl ||
    highlight.stories?.[0]?.media?.url ||
    ""
  );
};

const ProfileHighlights = ({ profile, isMyProfile }) => {
  const dispatch = useDispatch();

  const { highlights, loading, archiveLoading, error, actionLoading } =
    useSelector((state) => state.highlights);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);

  useEffect(() => {
    if (!profile?._id) return undefined;

    if (isMyProfile) {
      dispatch(fetchMyHighlights());
      dispatch(fetchArchivedStories());
    } else {
      dispatch(fetchUserHighlights(profile._id));
    }

    return () => {
      dispatch(resetHighlights());
    };
  }, [dispatch, isMyProfile, profile?._id]);

  const handleDeleteHighlight = async (highlightId) => {
    await dispatch(deleteHighlight(highlightId));
  };

  if (loading) {
    return <StoryTraySkeleton count={5} />;
  }

  if (!isMyProfile && highlights.length === 0) {
    return null;
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        {error ? (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex gap-5 overflow-x-auto pb-1">
          {isMyProfile ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex shrink-0 flex-col items-center gap-2"
              disabled={archiveLoading}
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Plus size={26} />
              </span>

              <span className="max-w-24 truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                {archiveLoading ? "Loading..." : "New"}
              </span>
            </button>
          ) : null}

          {highlights.map((highlight) => {
            const cover = getHighlightCover(highlight);

            return (
              <div
                key={highlight._id}
                className="group relative flex shrink-0 flex-col items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setActiveHighlight(highlight)}
                  className="h-20 w-20 overflow-hidden rounded-full border-2 border-slate-300 p-1 dark:border-slate-700"
                >
                  <span className="block h-full w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                    {cover ? (
                      <img
                        src={cover}
                        alt={highlight.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                        {highlight.title?.slice(0, 1)?.toUpperCase()}
                      </span>
                    )}
                  </span>
                </button>

                <span className="max-w-24 truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {highlight.title}
                </span>

                {isMyProfile ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteHighlight(highlight._id)}
                    disabled={actionLoading}
                    className="absolute right-0 top-0 hidden rounded-full bg-red-600 p-1 text-white group-hover:block disabled:opacity-60"
                    aria-label="Delete highlight"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <CreateHighlightModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <HighlightViewerModal
        highlight={activeHighlight}
        onClose={() => setActiveHighlight(null)}
      />
    </>
  );
};

export default ProfileHighlights;

import { Heart, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
import {
  clearCurrentStory,
  clearStoryStatus,
  fetchSingleStory,
  likeStory,
  replyStory,
} from "../features/stories/storySlice";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const StoryViewerPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const { currentStory, loading, actionLoading, error, successMessage } =
    useSelector((state) => state.stories);

  const [replyText, setReplyText] = useState("");

  const media = currentStory?.media;
  const author = currentStory?.author;
  const currentUserId = currentUser?._id;
  const storyCaption = currentStory?.caption || currentStory?.text;
  const isOwnStory = getId(author) === currentUserId;

  const isLiked = useMemo(() => {
    return currentStory?.likes?.some((item) => getId(item) === currentUserId);
  }, [currentStory?.likes, currentUserId]);

  useEffect(() => {
    dispatch(fetchSingleStory(storyId));

    return () => {
      dispatch(clearCurrentStory());
      dispatch(clearStoryStatus());
    };
  }, [dispatch, storyId]);

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!replyText.trim()) return;

    const result = await dispatch(
      replyStory({
        storyId,
        text: replyText.trim(),
      }),
    );

    if (replyStory.fulfilled.match(result)) {
      setReplyText("");
    }
  };

  if (loading && !currentStory) {
    return (
      <section className="flex min-h-[calc(100vh-48px)] items-center justify-center">
        <p className="text-sm text-slate-500">Loading story...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-xl">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </section>
    );
  }

  if (!currentStory) {
    return null;
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-md items-center justify-center">
      <article className="relative h-[calc(100vh-96px)] max-h-205 min-h-155 w-full overflow-hidden rounded-2xl bg-black text-white">
        <div className="absolute left-0 right-0 top-0 z-30 p-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-full bg-white" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              to={`/profile/${author?.username}`}
              className="flex min-w-0 items-center gap-3"
            >
              <Avatar
                src={author?.avatar?.url}
                alt={author?.username}
                size="sm"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {author?.username || "unknown"}
                </p>

                {currentStory.visibility === "close_friends" ? (
                  <p className="text-xs text-green-300">Close friends</p>
                ) : null}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full bg-black/30 p-2"
              aria-label="Close story"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {media?.type === "video" ? (
          <video
            src={media.optimizedUrl || media.url}
            controls
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={media?.optimizedUrl || media?.url}
            alt="Story"
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-x-0 bottom-0 z-30 bg-linear-to-t from-black/80 to-transparent p-4">
          {storyCaption ? (
            <p className="mb-4 rounded-2xl bg-black/30 p-3 text-sm">
              {storyCaption}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mb-3 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs text-emerald-100">
              {successMessage}
            </p>
          ) : null}

          {isOwnStory ? (
            <p className="rounded-full border border-white/30 bg-black/30 px-4 py-3 text-center text-sm text-white/80">
              This is your story
            </p>
          ) : (
            <form
              onSubmit={handleReplySubmit}
              className="flex items-center gap-3"
            >
              <input
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder={`Reply to ${author?.username || "story"}...`}
                className="flex-1 rounded-full border border-white/40 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/70"
              />

              <button
                type="button"
                onClick={() => dispatch(likeStory({ storyId, isLiked }))}
                className={isLiked ? "text-red-400" : "text-white"}
                aria-label="Like story"
              >
                <Heart size={25} fill={isLiked ? "currentColor" : "none"} />
              </button>

              <button
                type="submit"
                disabled={actionLoading || !replyText.trim()}
                className="rounded-full bg-white p-3 text-slate-950 disabled:opacity-60"
                aria-label="Send reply"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </article>
    </section>
  );
};

export default StoryViewerPage;

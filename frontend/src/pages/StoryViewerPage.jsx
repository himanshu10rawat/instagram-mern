import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Send,
  Share2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../components/common/Avatar";
import ModalShell from "../components/ui/ModalShell";
import { SkeletonBlock } from "../components/ui/Skeleton";
import ShareModal from "../features/messages/components/ShareModal";
import {
  clearCurrentStory,
  clearStoryStatus,
  fetchSingleStory,
  fetchStoryEngagement,
  fetchUserStories,
  likeStory,
  replyStory,
} from "../features/stories/storySlice";

const getId = (value) => (typeof value === "string" ? value : value?._id);
const getStoryTime = (story) => Date.parse(story?.createdAt || "") || 0;
const getViewerUser = (viewer) => viewer?.user || viewer;
const STORY_AUTO_ADVANCE_MS = 5000;
const STORY_HOLD_TO_PAUSE_MS = 250;

const StoryEngagementModal = ({
  activeTab,
  likes,
  loading,
  onClose,
  onTabChange,
  viewers,
}) => {
  const items = activeTab === "viewers" ? viewers : likes;

  return (
    <ModalShell
      title="Story activity"
      description={`${viewers.length} views · ${likes.length} likes`}
      onClose={onClose}
      className="max-w-md"
      contentClassName="p-4"
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onTabChange("viewers")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
            activeTab === "viewers"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          <Eye size={17} />
          Views
        </button>

        <button
          type="button"
          onClick={() => onTabChange("likes")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
            activeTab === "likes"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          <Heart size={17} />
          Likes
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading activity...
        </p>
      ) : null}

      {!loading && items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {activeTab === "viewers"
            ? "No one has viewed this story yet."
            : "No likes on this story yet."}
        </p>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const user = getViewerUser(item);
            const key = getId(user) || getId(item) || item?.viewedAt;

            return (
              <div key={key} className="flex items-center gap-3">
                <Avatar src={user?.avatar?.url} alt={user?.username} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {user?.username || "Unknown user"}
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.fullName ||
                      (item?.viewedAt
                        ? `Viewed ${new Date(item.viewedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}`
                        : "Liked your story")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </ModalShell>
  );
};

const StoryViewerPage = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [engagementTab, setEngagementTab] = useState("viewers");
  const [isPaused, setIsPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState({
    storyId: "",
    value: 0,
  });
  const progressStartRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);
  const pointerDownAtRef = useRef(0);
  const suppressTapNavigationRef = useRef(false);
  const videoRef = useRef(null);
  const { storyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const {
    currentStory,
    loading,
    actionLoading,
    error,
    engagementLoading,
    successMessage,
    viewerAuthorId,
    viewerStories,
    storyEngagementById,
  } = useSelector((state) => state.stories);

  const [replyText, setReplyText] = useState("");

  const media = currentStory?.media;
  const author = currentStory?.author;
  const authorId = getId(author);
  const currentUserId = currentUser?._id;
  const storyCaption = currentStory?.caption || currentStory?.text;
  const isOwnStory = getId(author) === currentUserId;
  const activeStories = useMemo(() => {
    const stories =
      viewerAuthorId === authorId && viewerStories.length
        ? viewerStories
        : currentStory
          ? [currentStory]
          : [];

    return [...stories].sort((first, second) => {
      return getStoryTime(first) - getStoryTime(second);
    });
  }, [authorId, currentStory, viewerAuthorId, viewerStories]);
  const currentStoryIndex = activeStories.findIndex(
    (story) => story?._id === currentStory?._id,
  );
  const previousStory =
    currentStoryIndex > 0 ? activeStories[currentStoryIndex - 1] : null;
  const nextStory =
    currentStoryIndex >= 0 && currentStoryIndex < activeStories.length - 1
      ? activeStories[currentStoryIndex + 1]
      : null;
  const storyEngagement = storyEngagementById[storyId] || {};
  const storyViewers = storyEngagement.viewers || currentStory?.viewers || [];
  const storyLikes = storyEngagement.likes || currentStory?.likes || [];

  const isLiked = useMemo(() => {
    return currentStory?.likes?.some((item) => getId(item) === currentUserId);
  }, [currentStory?.likes, currentUserId]);

  const storyReturnTo =
    typeof location.state?.storyReturnTo === "string"
      ? location.state.storyReturnTo
      : "/";
  const storyNavigationState = useMemo(
    () => ({
      ...(location.state || {}),
      storyReturnTo,
    }),
    [location.state, storyReturnTo],
  );
  const isTimelinePaused = isPaused || showShareModal || showEngagementModal;
  const currentStoryProgress =
    storyProgress.storyId === currentStory?._id ? storyProgress.value : 0;

  const pauseStory = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeStory = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleStoryPointerDown = useCallback(() => {
    pointerDownAtRef.current = performance.now();
    suppressTapNavigationRef.current = false;
    pauseStory();
  }, [pauseStory]);

  const handleStoryPointerUp = useCallback(() => {
    const pressStartedAt = pointerDownAtRef.current;
    const pressDuration = pressStartedAt
      ? performance.now() - pressStartedAt
      : 0;

    pointerDownAtRef.current = 0;
    suppressTapNavigationRef.current = pressDuration >= STORY_HOLD_TO_PAUSE_MS;
    resumeStory();

    window.setTimeout(() => {
      suppressTapNavigationRef.current = false;
    }, 0);
  }, [resumeStory]);

  const handleStoryPointerEnd = useCallback(() => {
    pointerDownAtRef.current = 0;
    suppressTapNavigationRef.current = false;
    resumeStory();
  }, [resumeStory]);

  const shouldIgnoreTapNavigation = useCallback(() => {
    if (!suppressTapNavigationRef.current) return false;

    suppressTapNavigationRef.current = false;
    return true;
  }, []);

  const handleCloseStory = useCallback(() => {
    setIsPaused(false);
    navigate(storyReturnTo, { replace: true });
  }, [navigate, storyReturnTo]);

  const handleNavigateStory = useCallback(
    (story) => {
      if (!story?._id) return;

      setIsPaused(false);
      navigate(`/stories/${story._id}`, {
        replace: true,
        state: storyNavigationState,
      });
    },
    [navigate, storyNavigationState],
  );

  const handlePreviousStory = useCallback(() => {
    if (!previousStory) return;

    handleNavigateStory(previousStory);
  }, [handleNavigateStory, previousStory]);

  const handleNextStory = useCallback(() => {
    if (nextStory) {
      handleNavigateStory(nextStory);
      return;
    }

    handleCloseStory();
  }, [handleCloseStory, handleNavigateStory, nextStory]);

  const handlePreviousStoryTap = useCallback(() => {
    if (shouldIgnoreTapNavigation()) return;

    handlePreviousStory();
  }, [handlePreviousStory, shouldIgnoreTapNavigation]);

  const handleNextStoryTap = useCallback(() => {
    if (shouldIgnoreTapNavigation()) return;

    handleNextStory();
  }, [handleNextStory, shouldIgnoreTapNavigation]);

  useEffect(() => {
    dispatch(fetchSingleStory(storyId));

    return () => {
      dispatch(clearCurrentStory());
      dispatch(clearStoryStatus());
    };
  }, [dispatch, storyId]);

  useEffect(() => {
    if (!authorId || viewerAuthorId === authorId) return;

    dispatch(fetchUserStories(authorId));
  }, [authorId, dispatch, viewerAuthorId]);

  useEffect(() => {
    if (!isOwnStory || !storyId) return;

    dispatch(fetchStoryEngagement(storyId));
  }, [dispatch, isOwnStory, storyId]);

  useEffect(() => {
    elapsedBeforePauseRef.current = 0;
    progressStartRef.current = performance.now();
  }, [storyId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isTimelinePaused) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  }, [isTimelinePaused, media?.optimizedUrl, media?.url]);

  useEffect(() => {
    if (!currentStory?._id || isTimelinePaused) return undefined;

    progressStartRef.current = performance.now();
    let frameId;

    const updateProgress = (now) => {
      const elapsed =
        elapsedBeforePauseRef.current + now - progressStartRef.current;
      const nextProgress = Math.min(
        (elapsed / STORY_AUTO_ADVANCE_MS) * 100,
        100,
      );

      setStoryProgress({
        storyId: currentStory._id,
        value: nextProgress,
      });

      if (nextProgress >= 100) {
        elapsedBeforePauseRef.current = STORY_AUTO_ADVANCE_MS;
        handleNextStory();
        return;
      }

      frameId = requestAnimationFrame(updateProgress);
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(frameId);
      elapsedBeforePauseRef.current = Math.min(
        elapsedBeforePauseRef.current +
          performance.now() -
          progressStartRef.current,
        STORY_AUTO_ADVANCE_MS,
      );
    };
  }, [currentStory?._id, handleNextStory, isTimelinePaused]);

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
      <section className="mx-auto flex h-full min-h-0 max-w-md items-center justify-center md:min-h-[calc(100dvh_-_2rem)]">
        <SkeletonBlock className="h-full w-full rounded-none md:h-[calc(100dvh_-_2rem)] md:rounded-2xl" />
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
    <section className="mx-auto flex h-full min-h-0 max-w-md items-center justify-center md:min-h-[calc(100dvh_-_2rem)]">
      <article
        className="relative h-full min-h-0 w-full overflow-hidden bg-black text-white md:h-[calc(100dvh_-_2rem)] md:max-h-205 md:min-h-155 md:rounded-2xl"
        onPointerDownCapture={handleStoryPointerDown}
        onPointerUpCapture={handleStoryPointerUp}
        onPointerCancelCapture={handleStoryPointerEnd}
        onPointerLeave={handleStoryPointerEnd}
      >
        <div className="absolute left-0 right-0 top-0 z-30 p-4">
          <div className="flex gap-1">
            {(activeStories.length ? activeStories : [currentStory]).map(
              (story, index) => {
                const activeIndex = Math.max(currentStoryIndex, 0);
                const progressWidth =
                  index < activeIndex
                    ? "100%"
                    : index === activeIndex
                      ? `${currentStoryProgress}%`
                      : "0%";

                return (
                  <div
                    key={story?._id || index}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
                  >
                    <div
                      className="h-full bg-white transition-[width] duration-75 ease-linear"
                      style={{ width: progressWidth }}
                    />
                  </div>
                );
              },
            )}
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
              onClick={handleCloseStory}
              className="rounded-full bg-black/30 p-2"
              aria-label="Close story"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {media?.type === "video" ? (
          <video
            ref={videoRef}
            src={media.optimizedUrl || media.url}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={media?.optimizedUrl || media?.url}
            alt="Story"
            className="h-full w-full object-cover"
          />
        )}

        <button
          type="button"
          onClick={handlePreviousStoryTap}
          disabled={!previousStory}
          className="absolute bottom-32 left-0 top-24 z-20 w-1/2 disabled:cursor-default"
          aria-label="Previous story"
        />

        <button
          type="button"
          onClick={handleNextStoryTap}
          className="absolute bottom-32 right-0 top-24 z-20 w-1/2"
          aria-label={nextStory ? "Next story" : "Close story"}
        />

        {previousStory ? (
          <div className="pointer-events-none absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur">
            <ChevronLeft size={22} />
          </div>
        ) : null}

        {nextStory ? (
          <div className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur">
            <ChevronRight size={22} />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-30 bg-linear-to-t from-black/80 to-transparent p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
            <div className="rounded-2xl border border-white/25 bg-black/35 p-3 backdrop-blur">
              <p className="text-center text-sm font-semibold text-white/90">
                This is your story
              </p>

              <button
                type="button"
                onClick={() => {
                  setEngagementTab("viewers");
                  setShowEngagementModal(true);
                }}
                className="mt-3 grid min-h-12 w-full grid-cols-2 overflow-hidden rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white"
              >
                <span className="flex items-center justify-center gap-2 border-r border-white/20">
                  <Eye size={18} />
                  {storyViewers.length} views
                </span>

                <span className="flex items-center justify-center gap-2">
                  <Heart size={18} />
                  {storyLikes.length} likes
                </span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleReplySubmit}
              className="flex items-center gap-3"
            >
              <input
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                onBlur={resumeStory}
                onFocus={pauseStory}
                placeholder={`Reply to ${author?.username || "story"}...`}
                className="min-w-0 flex-1 rounded-full border border-white/40 bg-black/30 px-4 py-3 text-base text-white outline-none placeholder:text-white/70 sm:text-sm"
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

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="rounded-full bg-white/20 p-3 text-white"
                aria-label="Share story"
              >
                <Share2 size={18} />
              </button>
            </form>
          )}
        </div>
      </article>
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        sharePayload={{
          type: "story",
          storyId,
        }}
      />

      {showEngagementModal ? (
        <StoryEngagementModal
          activeTab={engagementTab}
          likes={storyLikes}
          loading={engagementLoading}
          onClose={() => setShowEngagementModal(false)}
          onTabChange={setEngagementTab}
          viewers={storyViewers}
        />
      ) : null}
    </section>
  );
};

export default StoryViewerPage;

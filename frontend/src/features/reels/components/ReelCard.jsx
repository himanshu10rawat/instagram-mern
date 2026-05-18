import {
  Bookmark,
  Heart,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import ShareModal from "../../messages/components/ShareModal";
import { commentReel, likeReel, saveReel } from "../reelSlice";

const ReelCard = ({ reel }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);

  const [isMuted, setIsMuted] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isLiked = reel.likes?.some((like) => {
    if (typeof like === "string") return like === currentUser?._id;
    return like?._id === currentUser?._id;
  });

  const isSaved = reel.savedBy?.some((savedUser) => {
    if (typeof savedUser === "string") return savedUser === currentUser?._id;
    return savedUser?._id === currentUser?._id;
  });

  const handleVideoClick = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;

    const result = await dispatch(
      commentReel({
        reelId: reel._id,
        text: commentText.trim(),
      }),
    );

    if (commentReel.fulfilled.match(result)) {
      setCommentText("");
    }
  };

  return (
    <article className="relative mx-auto flex h-[calc(100vh-96px)] max-h-205 min-h-155 w-full max-w-md snap-start overflow-hidden rounded-2xl bg-black text-white">
      <button
        type="button"
        onClick={handleVideoClick}
        className="absolute inset-0 z-10"
        aria-label="Play or pause reel"
      />

      <video
        ref={videoRef}
        src={reel.video?.optimizedUrl || reel.video?.url || reel.media?.url}
        className="h-full w-full object-cover"
        muted={isMuted}
        loop
        playsInline
        autoPlay
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4">
        <div className="pointer-events-auto flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <Avatar
                src={reel.author?.avatar?.url}
                alt={reel.author?.username}
                size="sm"
              />

              <p className="text-sm font-semibold">
                {reel.author?.username || "unknown"}
              </p>
            </div>

            {reel.caption ? (
              <p className="mt-3 max-h-10 overflow-hidden text-sm">
                {reel.caption}
              </p>
            ) : null}

            {reel.location ? (
              <p className="mt-1 text-xs text-white/70">{reel.location}</p>
            ) : null}
          </div>

          <div className="pointer-events-auto flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => dispatch(likeReel({ reelId: reel._id, isLiked }))}
              className="flex flex-col items-center gap-1"
            >
              <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-xs">{reel.likes?.length || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCommentBox((prev) => !prev)}
              className="flex flex-col items-center gap-1"
            >
              <MessageCircle size={28} />
              <span className="text-xs">
                {reel.commentsCount || reel.comments?.length || 0}
              </span>
            </button>

            <button type="button" onClick={() => setShowShareModal(true)}>
              <Send size={28} />
            </button>

            <button
              type="button"
              onClick={() => dispatch(saveReel({ reelId: reel._id, isSaved }))}
            >
              <Bookmark size={28} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <button type="button" onClick={handleMuteToggle}>
              {isMuted ? <VolumeX size={26} /> : <Volume2 size={26} />}
            </button>
          </div>
        </div>

        {showCommentBox ? (
          <form
            onSubmit={handleCommentSubmit}
            className="pointer-events-auto mt-4 flex gap-2"
          >
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-xl bg-white/90 px-4 py-2 text-sm text-slate-950 outline-none"
            />

            <button
              type="submit"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Post
            </button>
          </form>
        ) : null}
      </div>

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        sharePayload={{
          type: "reel",
          reelId: reel._id,
        }}
      />
    </article>
  );
};

export default ReelCard;

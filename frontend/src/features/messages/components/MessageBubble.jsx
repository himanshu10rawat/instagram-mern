import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import MediaPreviewFallback from "../../../components/common/MediaPreviewFallback";
import { editMessage, reactMessage, removeMessageReaction } from "../messageSlice";

const getReplyPreview = (replyTo) => {
  if (!replyTo) return "";
  if (replyTo.text) return replyTo.text;
  if (replyTo.media?.type === "image") return "Photo";
  if (replyTo.media?.type === "video") return "Video";
  return replyTo.messageType || "Message";
};

const getMediaUrl = (media) => media?.optimizedUrl || media?.url;

const heartReactionValues = new Set(["<3", "heart", "like", "love"]);

const isHeartReaction = (emoji = "") => {
  const normalizedEmoji = emoji.toLowerCase();

  return (
    heartReactionValues.has(normalizedEmoji) ||
    normalizedEmoji.includes("\u2764")
  );
};

const getReactionUserId = (reaction) => {
  if (!reaction?.user) return "";
  if (typeof reaction.user === "string") return reaction.user;
  return reaction.user._id || "";
};

const getReactionGroupKey = (emoji = "") =>
  isHeartReaction(emoji) ? "heart" : emoji;

const getReactionGroups = (reactions = []) => {
  const groups = new Map();

  reactions.forEach((reaction) => {
    const key = getReactionGroupKey(reaction.emoji);
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.count += 1;
      return;
    }

    groups.set(key, {
      count: 1,
      emoji: reaction.emoji,
      key,
    });
  });

  return Array.from(groups.values());
};

const isDeletedSharedProfile = (profile) => !profile || profile.isDeleted;

const MessageBubble = ({ message, isMine, onReply }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [mediaPreviewFailed, setMediaPreviewFailed] = useState(false);
  const reactionGroups = getReactionGroups(message.reactions);
  const storyReturnState = {
    storyReturnTo: `${location.pathname}${location.search}`,
  };
  const hasCurrentUserReaction = message.reactions?.some(
    (reaction) => getReactionUserId(reaction) === currentUser?._id,
  );

  const handleReact = () => {
    if (hasCurrentUserReaction) {
      dispatch(removeMessageReaction(message._id));
      return;
    }

    dispatch(
      reactMessage({
        messageId: message._id,
        emoji: "heart",
      }),
    );
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    const result = await dispatch(
      editMessage({
        messageId: message._id,
        text: editText.trim(),
      }),
    );

    if (editMessage.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`flex min-w-0 ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[82%] overflow-hidden rounded-2xl px-4 py-2 sm:max-w-[75%] ${
          isMine
            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
            : "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
        }`}
      >
        {message.replyTo ? (
          <div
            className={`mb-2 rounded-xl px-3 py-2 text-xs ${
              isMine
                ? "bg-white/10 text-white/80 dark:bg-slate-950/10 dark:text-slate-600"
              : "bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-300"
            }`}
          >
            Replying to: {getReplyPreview(message.replyTo)}
          </div>
        ) : null}

        {message.media?.url ? (
          <div className="mb-2 overflow-hidden rounded-xl bg-black/10 dark:bg-white/10">
            {message.media.type === "video" ? (
              <video
                src={getMediaUrl(message.media)}
                controls
                poster={message.media.thumbnailUrl}
                className="max-h-96 w-full max-w-full object-contain"
              />
            ) : !mediaPreviewFailed ? (
              <img
                src={getMediaUrl(message.media)}
                alt="Message media"
                loading="lazy"
                decoding="async"
                onError={() => setMediaPreviewFailed(true)}
                className="max-h-96 w-full max-w-full object-contain"
              />
            ) : (
              <div className="h-52 w-full">
                <MediaPreviewFallback
                  label="IMAGE"
                  message="Preview unavailable"
                />
              </div>
            )}
          </div>
        ) : null}

        {isEditing ? (
          <div className="space-y-2">
            <input
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-slate-950 outline-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="text-xs font-semibold"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.text ? (
              <p className="break-words text-sm">{message.text}</p>
            ) : null}

            {message.shared?.post ? (
              <Link
                to={`/posts/${message.shared.post._id}`}
                className="mt-2 block rounded-xl bg-black/10 p-3 text-sm font-semibold"
              >
                Shared a post
              </Link>
            ) : null}

            {message.shared?.reel ? (
              <Link
                to={`/reels/${message.shared.reel._id}`}
                className="mt-2 block rounded-xl bg-black/10 p-3 text-sm font-semibold"
              >
                Shared a reel
              </Link>
            ) : null}

            {message.shared?.story ? (
              <Link
                to={`/stories/${message.shared.story._id}`}
                state={storyReturnState}
                className="mt-2 block rounded-xl bg-black/10 p-3 text-sm font-semibold"
              >
                Shared a story
              </Link>
            ) : null}

            {message.shared?.profile ? (
              isDeletedSharedProfile(message.shared.profile) ? (
                <div className="mt-2 block rounded-xl bg-black/10 p-3 text-sm font-semibold">
                  Shared profile is no longer available
                </div>
              ) : (
                <Link
                  to={`/profile/${message.shared.profile.username}`}
                  className="mt-2 block rounded-xl bg-black/10 p-3 text-sm font-semibold"
                >
                  Shared @{message.shared.profile.username}
                </Link>
              )
            ) : null}
          </>
        )}

        <div
          className={`mt-1 flex items-center gap-2 text-[11px] ${
            isMine ? "text-white/60 dark:text-slate-500" : "text-slate-500"
          }`}
        >
          <span>
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>

          {message.isEdited ? <span>edited</span> : null}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleReact}
            className={`text-xs ${
              isMine ? "text-white/80 dark:text-slate-600" : "text-slate-500"
            }`}
          >
            {hasCurrentUserReaction ? "Unlike" : "Like"}
          </button>

          <button
            type="button"
            onClick={() => onReply?.(message)}
            className={`text-xs ${
              isMine ? "text-white/80 dark:text-slate-600" : "text-slate-500"
            }`}
          >
            Reply
          </button>

          {isMine && message.messageType === "text" && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`text-xs ${
                isMine ? "text-white/80 dark:text-slate-600" : "text-slate-500"
              }`}
            >
              Edit
            </button>
          ) : null}
        </div>

        {reactionGroups.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {reactionGroups.map((reactionGroup) => (
              <span
                key={reactionGroup.key}
                className={`inline-flex h-6 min-w-6 items-center justify-center gap-1 rounded-full px-1.5 text-xs shadow-sm ${
                  isMine
                    ? "bg-white text-red-500 dark:bg-slate-950"
                    : "bg-white text-red-500 dark:bg-slate-800"
                }`}
                title={
                  reactionGroup.key === "heart"
                    ? `${reactionGroup.count} like${
                        reactionGroup.count > 1 ? "s" : ""
                      }`
                    : `${reactionGroup.count} ${reactionGroup.emoji}`
                }
              >
                {reactionGroup.key === "heart" ? (
                  <Heart size={14} fill="currentColor" aria-hidden="true" />
                ) : (
                  reactionGroup.emoji
                )}

                {reactionGroup.count > 1 ? (
                  <span className="font-semibold leading-none">
                    {reactionGroup.count}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MessageBubble;

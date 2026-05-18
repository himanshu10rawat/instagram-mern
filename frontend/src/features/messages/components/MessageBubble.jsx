import { useState } from "react";
import { useDispatch } from "react-redux";

import { editMessage, reactMessage } from "../messageSlice";

const MessageBubble = ({ message, isMine }) => {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");

  const handleReact = () => {
    dispatch(
      reactMessage({
        messageId: message._id,
        emoji: "<3",
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
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
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
            Replying to: {message.replyTo.text || message.replyTo.messageType}
          </div>
        ) : null}

        {message.media?.url ? (
          <div className="mb-2 overflow-hidden rounded-xl">
            {message.media.type === "video" ? (
              <video
                src={message.media.url}
                controls
                className="max-h-72 w-full"
              />
            ) : (
              <img
                src={message.media.url}
                alt="Message media"
                className="max-h-72 w-full object-cover"
              />
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
            {message.text ? <p className="text-sm">{message.text}</p> : null}

            {message.shared?.post ? (
              <p className="text-sm font-semibold">Shared a post</p>
            ) : null}

            {message.shared?.reel ? (
              <p className="text-sm font-semibold">Shared a reel</p>
            ) : null}

            {message.shared?.story ? (
              <p className="text-sm font-semibold">Shared a story</p>
            ) : null}

            {message.shared?.profile ? (
              <p className="text-sm font-semibold">
                Shared @{message.shared.profile.username}
              </p>
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
            Like
          </button>

          {isMine && message.messageType === "text" && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`text-xs ${
                isMine
                  ? "text-white/80 dark:text-slate-600"
                  : "text-slate-500"
              }`}
            >
              Edit
            </button>
          ) : null}
        </div>

        {message.reactions?.length > 0 ? (
          <div className="mt-2 text-xs">
            {message.reactions.map((reaction) => reaction.emoji).join(" ")}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MessageBubble;

import { ArrowLeft, Image, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { SkeletonBlock } from "../../../components/ui/Skeleton";
import { getSocket } from "../../../lib/socket";
import {
  fetchMessages,
  markConversationSeen,
  sendMessage,
  setActiveConversation,
} from "../messageSlice";
import MessageBubble from "./MessageBubble";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find((participant) => {
    if (typeof participant === "string") return participant !== currentUserId;

    return participant._id !== currentUserId;
  });
};

const ChatWindow = () => {
  const dispatch = useDispatch();

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);
  const {
    activeConversation,
    messages,
    messagesLoading,
    typingUsers,
  } = useSelector((state) => state.messages);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [sendingReceiverId, setSendingReceiverId] = useState(null);

  const otherUser = getOtherParticipant(activeConversation, currentUser?._id);
  const filePreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    if (activeConversation?._id) {
      dispatch(
        fetchMessages({ conversationId: activeConversation._id, page: 1 }),
      );
      dispatch(markConversationSeen(activeConversation._id));
    }
  }, [activeConversation?._id, dispatch]);

  useEffect(() => {
    if (activeConversation?._id && messages.length > 0) {
      dispatch(markConversationSeen(activeConversation._id));
    }
  }, [activeConversation?._id, dispatch, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  if (!activeConversation) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Your messages
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  const handleTyping = () => {
    const socket = getSocket();

    if (!socket || !otherUser?._id) return;

    socket.emit("typing", {
      conversationId: activeConversation._id,
      senderId: currentUser._id,
      receiverId: otherUser._id,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: activeConversation._id,
        senderId: currentUser._id,
        receiverId: otherUser._id,
      });
    }, 900);
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!text.trim() && !file) return;

    setSendingReceiverId(otherUser._id);

    try {
      const result = await dispatch(
        sendMessage({
          receiverId: otherUser._id,
          text: text.trim(),
          file,
          replyTo: replyTarget?._id,
        }),
      );

      if (sendMessage.fulfilled.match(result)) {
        setText("");
        setFile(null);
        setReplyTarget(null);
      }
    } finally {
      setSendingReceiverId(null);
    }
  };

  const getReplyPreview = (message) => {
    if (!message) return "";
    if (message.text) return message.text;
    if (message.media?.type === "image") return "Photo";
    if (message.media?.type === "video") return "Video";
    return message.messageType || "Message";
  };

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const isTyping = Boolean(typingUsers[activeConversation._id]);
  const isSending = sendingReceiverId === otherUser?._id;

  return (
    <div className="flex h-[calc(100dvh-10.5rem)] min-h-0 flex-col overflow-hidden md:h-[calc(100dvh-3rem)] rounded-t-2xl md:rounded-2xl md:border md:border-slate-200 md:dark:border-slate-800 bg-white dark:bg-slate-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800 sm:p-4">
        <button
          type="button"
          onClick={() => dispatch(setActiveConversation(null))}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900 md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>

        <Avatar src={otherUser?.avatar?.url} alt={otherUser?.username} />

        <div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
            {otherUser?.username}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTyping ? "typing..." : otherUser?.fullName || "Chat"}
          </p>
        </div>
      </header>

      {activeConversation.status === "requested" ? (
        <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          This conversation is in message requests. Messages may not appear in
          inbox until accepted.
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {messagesLoading ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-10 w-2/3 rounded-2xl" />
            <SkeletonBlock className="ml-auto h-10 w-1/2 rounded-2xl" />
            <SkeletonBlock className="h-10 w-3/5 rounded-2xl" />
          </div>
        ) : null}

        {!messagesLoading
          ? messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isMine={message.sender?._id === currentUser?._id}
                onReply={setReplyTarget}
              />
            ))
          : null}

        <div ref={bottomRef} />
      </div>

      {replyTarget ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <div className="min-w-0">
            <p className="font-semibold text-slate-950 dark:text-white">
              Replying to{" "}
              {replyTarget.sender?._id === currentUser?._id
                ? "yourself"
                : replyTarget.sender?.username || otherUser?.username || "user"}
            </p>
            <p className="truncate text-xs">{getReplyPreview(replyTarget)}</p>
          </div>

          <button
            type="button"
            onClick={() => setReplyTarget(null)}
            disabled={isSending}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-label="Cancel reply"
          >
            <X size={18} />
          </button>
        </div>
      ) : null}

      {file ? (
        <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
            {file.type.startsWith("video/") ? (
              <video
                src={filePreviewUrl}
                className="h-full w-full object-cover"
                muted
              />
            ) : (
              <img
                src={filePreviewUrl}
                alt="Selected media preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-950 dark:text-white">
              {file.name}
            </p>
            <p className="text-xs">
              {file.type.startsWith("video/") ? "Video selected" : "Image selected"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFile(null)}
            disabled={isSending}
            className="font-semibold text-red-500 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-slate-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-slate-800 sm:gap-3 sm:p-4"
      >
        <label className="shrink-0 cursor-pointer rounded-xl p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
          <Image size={22} />

          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <input
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            handleTyping();
          }}
          disabled={isSending}
          placeholder={replyTarget ? "Reply..." : "Message..."}
          enterKeyHint="send"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none disabled:opacity-70 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-white"
        />

        <button
          type="submit"
          disabled={isSending || (!text.trim() && !file)}
          className="flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Send size={18} />
          {isSending ? <span>Sending...</span> : null}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

import { ArrowLeft, Image, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    sending,
    typingUsers,
  } = useSelector((state) => state.messages);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const otherUser = getOtherParticipant(activeConversation, currentUser?._id);

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

    const result = await dispatch(
      sendMessage({
        receiverId: otherUser._id,
        text: text.trim(),
        file,
      }),
    );

    if (sendMessage.fulfilled.match(result)) {
      setText("");
      setFile(null);
    }
  };

  const isTyping = Boolean(typingUsers[activeConversation._id]);

  return (
    <div className="flex h-[calc(100dvh_-_10.5rem)] min-h-0 flex-col overflow-hidden md:h-[calc(100dvh_-_3rem)] rounded-t-2xl md:rounded-2xl md:border md:border-slate-200 md:dark:border-slate-800 bg-white dark:bg-slate-950">
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
              />
            ))
          : null}

        <div ref={bottomRef} />
      </div>

      {file ? (
        <div className="shrink-0 border-t border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          Selected: {file.name}
          <button
            type="button"
            onClick={() => setFile(null)}
            className="ml-3 font-semibold text-red-500"
          >
            Remove
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-slate-200 p-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] dark:border-slate-800 sm:gap-3 sm:p-4"
      >
        <label className="shrink-0 cursor-pointer rounded-xl p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
          <Image size={22} />

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        <input
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            handleTyping();
          }}
          placeholder="Message..."
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-white"
        />

        <button
          type="submit"
          disabled={sending}
          className="shrink-0 rounded-xl bg-slate-950 p-3 text-white disabled:opacity-60"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

import { Image, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { getSocket } from "../../../lib/socket";
import {
  fetchMessages,
  markConversationSeen,
  sendMessage,
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Your messages</h2>
          <p className="mt-2 text-sm text-slate-500">
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
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 p-4">
        <Avatar src={otherUser?.avatar?.url} alt={otherUser?.username} />

        <div>
          <h2 className="text-sm font-semibold text-slate-950">
            {otherUser?.username}
          </h2>

          <p className="text-xs text-slate-500">
            {isTyping ? "typing..." : otherUser?.fullName || "Chat"}
          </p>
        </div>
      </header>

      {activeConversation.status === "requested" ? (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          This conversation is in message requests. Messages may not appear in
          inbox until accepted.
        </div>
      ) : null}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messagesLoading ? (
          <p className="text-sm text-slate-500">Loading messages...</p>
        ) : null}

        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isMine={message.sender?._id === currentUser?._id}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {file ? (
        <div className="border-t border-slate-200 px-4 py-2 text-sm text-slate-600">
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
        className="flex items-center gap-3 border-t border-slate-200 p-4"
      >
        <label className="cursor-pointer rounded-xl p-2 hover:bg-slate-100">
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
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
        />

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-slate-950 p-3 text-white disabled:opacity-60"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

import { Search, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { fetchConversations, shareToMessage } from "../messageSlice";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find((participant) => {
    if (typeof participant === "string") {
      return participant !== currentUserId;
    }

    return participant?._id !== currentUserId;
  });
};

const ShareModal = ({ open, onClose, sharePayload }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const { conversations = [], sending } = useSelector(
    (state) => state.messages,
  );

  const currentUserId = currentUser?._id;

  const [searchValue, setSearchValue] = useState("");
  const [sentUserIds, setSentUserIds] = useState([]);

  useEffect(() => {
    if (open) {
      dispatch(fetchConversations());
    }
  }, [dispatch, open]);

  const filteredConversations = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const user = getOtherParticipant(conversation, currentUserId);

      return (
        user?.username?.toLowerCase().includes(query) ||
        user?.fullName?.toLowerCase().includes(query)
      );
    });
  }, [conversations, currentUserId, searchValue]);

  if (!open) {
    return null;
  }

  const handleShare = async (receiverId) => {
    const result = await dispatch(
      shareToMessage({
        receiverId,
        ...sharePayload,
      }),
    );

    if (shareToMessage.fulfilled.match(result)) {
      setSentUserIds((prev) => [...prev, receiverId]);
      dispatch(fetchConversations());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Share
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Close share modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700">
            <Search size={18} className="text-slate-500" />

            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search users"
              className="flex-1 bg-transparent text-sm outline-none dark:text-white"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredConversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-slate-500">
              No conversations found.
            </p>
          ) : null}

          {filteredConversations.map((conversation) => {
            const user = getOtherParticipant(conversation, currentUserId);
            const isSent = sentUserIds.includes(user?._id);

            return (
              <div
                key={conversation._id}
                className="flex items-center justify-between gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar src={user?.avatar?.url} alt={user?.username} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {user?.username || "Unknown user"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.fullName || "Instagram user"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(user?._id)}
                  disabled={!user?._id || sending || isSent}
                  className="flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                >
                  <Send size={14} />
                  {isSent ? "Sent" : "Send"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

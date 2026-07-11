import { Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import EmptyState from "../../../components/ui/EmptyState";
import ModalShell from "../../../components/ui/ModalShell";
import { fetchConversations, shareToMessage } from "../messageSlice";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find((participant) => {
    if (!participant) return true;
    if (typeof participant === "string") {
      return participant !== currentUserId;
    }

    return participant?._id !== currentUserId;
  });
};

const isDeletedParticipant = (user) => !user || user.isDeleted;

const getParticipantName = (user) => {
  return isDeletedParticipant(user)
    ? "This user no longer exists"
    : user.username || "Unknown user";
};

const ShareModal = ({ open, onClose, sharePayload }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const { conversations = [] } = useSelector((state) => state.messages);

  const currentUserId = currentUser?._id;

  const [searchValue, setSearchValue] = useState("");
  const [sentUserIds, setSentUserIds] = useState([]);
  const [sendingUserId, setSendingUserId] = useState(null);

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
      if (isDeletedParticipant(user)) return false;

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
    setSendingUserId(receiverId);

    try {
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
    } finally {
      setSendingUserId(null);
    }
  };

  return (
    <ModalShell title="Share" onClose={onClose} className="max-w-md">
      <>
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700">
            <Search size={18} className="text-slate-500" />

            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search users"
              className="flex-1 bg-transparent text-sm outline-none dark:text-white"
              onFocus={() => {
                // ensure modal contents are scrolled into view on mobile when keyboard opens
                setTimeout(() => {
                  document.activeElement?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 250);
              }}
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredConversations.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No conversations found"
              description="Try another name or start a chat from their profile."
              variant="inline"
              size="sm"
            />
          ) : null}

          {filteredConversations.map((conversation) => {
            const user = getOtherParticipant(conversation, currentUserId);
            const isDeletedUser = isDeletedParticipant(user);
            const isSent = sentUserIds.includes(user?._id);
            const isSendingToUser = sendingUserId === user?._id;

            return (
              <div
                key={conversation._id}
                className="flex items-center justify-between gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={isDeletedUser ? "" : user?.avatar?.url}
                    alt={getParticipantName(user)}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {getParticipantName(user)}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {isDeletedUser ? "Account deleted" : user?.fullName || "pixelFeed user"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(user?._id)}
                  disabled={!user?._id || isDeletedUser || isSendingToUser || isSent}
                  className="flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                >
                  <Send size={14} />
                  {isSent ? "Sent" : isSendingToUser ? "Sending..." : "Send"}
                </button>
              </div>
            );
          })}
        </div>
      </>
    </ModalShell>
  );
};

export default ShareModal;

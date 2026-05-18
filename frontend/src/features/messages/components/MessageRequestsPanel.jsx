import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import {
  acceptMessageRequest,
  fetchConversations,
  fetchMessageRequests,
  rejectMessageRequest,
  setActiveConversation,
} from "../messageSlice";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find((participant) => {
    if (typeof participant === "string") return participant !== currentUserId;

    return participant?._id !== currentUserId;
  });
};

const MessageRequestsPanel = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const { requests } = useSelector((state) => state.messages);

  useEffect(() => {
    dispatch(fetchMessageRequests());
  }, [dispatch]);

  const handleAccept = async (conversationId) => {
    const result = await dispatch(acceptMessageRequest(conversationId));

    if (acceptMessageRequest.fulfilled.match(result)) {
      dispatch(fetchConversations());
      dispatch(setActiveConversation(result.payload));
    }
  };

  const handleReject = async (conversationId) => {
    await dispatch(rejectMessageRequest(conversationId));
  };

  if (!requests.length) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No message requests.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          Message Requests
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Accept request to start chatting.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {requests.map((conversation) => {
          const user = getOtherParticipant(conversation, currentUser?._id);

          return (
            <div key={conversation._id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar?.url} alt={user?.username} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {user?.username || "Unknown user"}
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {conversation.lastMessage?.text ||
                      conversation.lastMessage?.messageType ||
                      "Message request"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAccept(conversation._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                >
                  <Check size={16} />
                  Accept
                </button>

                <button
                  type="button"
                  onClick={() => handleReject(conversation._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  <X size={16} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageRequestsPanel;

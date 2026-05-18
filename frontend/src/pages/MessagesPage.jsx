import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import ChatWindow from "../features/messages/components/ChatWindow";
import ConversationList from "../features/messages/components/ConversationList";
import MessageRequestsPanel from "../features/messages/components/MessageRequestsPanel";
import {
  fetchConversations,
  fetchMessageRequests,
  setActiveConversation,
  startConversation,
} from "../features/messages/messageSlice";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find((participant) => {
    if (typeof participant === "string") {
      return participant !== currentUserId;
    }

    return participant?._id !== currentUserId;
  });
};

const MessagesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const receiverIdFromQuery = searchParams.get("user");

  const [activeTab, setActiveTab] = useState("inbox");
  const [hasHandledQueryUser, setHasHandledQueryUser] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;

  const {
    conversations = [],
    activeConversation,
    onlineUsers = [],
    loading,
    error,
    sending,
  } = useSelector((state) => state.messages);

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchMessageRequests());
  }, [dispatch]);

  const existingConversationFromQuery = useMemo(() => {
    if (!receiverIdFromQuery || !currentUserId) {
      return null;
    }

    return (
      conversations.find((conversation) => {
        const otherUser = getOtherParticipant(conversation, currentUserId);

        return otherUser?._id === receiverIdFromQuery;
      }) || null
    );
  }, [conversations, currentUserId, receiverIdFromQuery]);

  useEffect(() => {
    const openOrStartChat = async () => {
      if (!receiverIdFromQuery || !currentUserId || hasHandledQueryUser) {
        return;
      }

      if (existingConversationFromQuery) {
        dispatch(setActiveConversation(existingConversationFromQuery));
        setHasHandledQueryUser(true);
        return;
      }

      const result = await dispatch(startConversation(receiverIdFromQuery));

      if (startConversation.fulfilled.match(result)) {
        const conversation = result.payload;

        if (conversation) {
          dispatch(setActiveConversation(conversation));
        }

        await dispatch(fetchConversations());

        if (conversation?.status === "requested") {
          dispatch(fetchMessageRequests());
          setActiveTab("requests");
        }

        setHasHandledQueryUser(true);
      }
    };

    openOrStartChat();
  }, [
    currentUserId,
    dispatch,
    existingConversationFromQuery,
    hasHandledQueryUser,
    receiverIdFromQuery,
  ]);

  const handleSelectConversation = (conversation) => {
    dispatch(setActiveConversation(conversation));
  };

  return (
    <section className="h-[calc(100vh-48px)] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {error ? (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {sending ? (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
          Starting chat...
        </div>
      ) : null}

      <div className="grid h-full grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
        <div className={`${activeConversation ? "hidden md:block" : "block"}`}>
          <div className="h-full border-r border-slate-200">
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("inbox")}
                className={`flex-1 px-4 py-3 text-sm font-semibold ${
                  activeTab === "inbox"
                    ? "border-b-2 border-slate-950 text-slate-950"
                    : "text-slate-500"
                }`}
              >
                Inbox
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`flex-1 px-4 py-3 text-sm font-semibold ${
                  activeTab === "requests"
                    ? "border-b-2 border-slate-950 text-slate-950"
                    : "text-slate-500"
                }`}
              >
                Requests
              </button>
            </div>

            {activeTab === "inbox" ? (
              loading ? (
                <p className="p-4 text-sm text-slate-500">
                  Loading conversations...
                </p>
              ) : (
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversation?._id}
                  currentUserId={currentUserId}
                  onlineUsers={onlineUsers}
                  onSelect={handleSelectConversation}
                />
              )
            ) : (
              <MessageRequestsPanel />
            )}
          </div>
        </div>

        <div className={`${activeConversation ? "block" : "hidden md:block"}`}>
          <ChatWindow />
        </div>
      </div>
    </section>
  );
};

export default MessagesPage;

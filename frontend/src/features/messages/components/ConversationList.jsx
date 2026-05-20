import { MessageCircle } from "lucide-react";

import Avatar from "../../../components/common/Avatar";
import EmptyState from "../../../components/ui/EmptyState";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation.participants?.find((participant) => {
    if (typeof participant === "string") return participant !== currentUserId;

    return participant._id !== currentUserId;
  });
};

const ConversationList = ({
  conversations,
  activeConversationId,
  currentUserId,
  onlineUsers,
  onSelect,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 p-4 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-950 dark:text-white">
          Messages
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="Start a chat from any profile to see it here."
            variant="inline"
            size="sm"
            className="m-4"
          />
        ) : null}

        {conversations.map((conversation) => {
          const user = getOtherParticipant(conversation, currentUserId);
          const isActive = activeConversationId === conversation._id;
          const isOnline = onlineUsers.includes(user?._id);
          const unreadCount = Number(conversation.unreadCount) || 0;

          return (
            <button
              key={conversation._id}
              type="button"
              onClick={() => onSelect(conversation)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-900"
                  : "hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar src={user?.avatar?.url} alt={user?.username} />

                {isOnline ? (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-950" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {user?.username || "Unknown user"}
                  </p>

                  {unreadCount > 0 ? (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </div>

                <p
                  className={`truncate text-xs ${
                    unreadCount > 0
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {conversation.lastMessage?.text ||
                    conversation.lastMessage?.messageType ||
                    "Start conversation"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;

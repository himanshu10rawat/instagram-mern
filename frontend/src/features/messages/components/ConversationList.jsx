import Avatar from "../../../components/common/Avatar";

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800">
      <div className="shrink-0 border-b border-slate-200 p-4 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-950 dark:text-white">
          Messages
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
            No conversations yet.
          </p>
        ) : null}

        {conversations.map((conversation) => {
          const user = getOtherParticipant(conversation, currentUserId);
          const isActive = activeConversationId === conversation._id;
          const isOnline = onlineUsers.includes(user?._id);

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
              <div className="relative">
                <Avatar src={user?.avatar?.url} alt={user?.username} />

                {isOnline ? (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-950" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                  {user?.username || "Unknown user"}
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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

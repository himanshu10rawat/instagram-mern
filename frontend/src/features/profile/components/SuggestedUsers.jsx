import Avatar from "../../../components/common/Avatar";

const SuggestedUsers = ({ users = [] }) => {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Suggested for you</h2>

        <div className="mt-4 space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">No suggestions yet.</p>
          ) : (
            users.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar?.url}
                    alt={user.username}
                    size="md"
                  />

                  <div>
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs text-slate-500">
                      {user.fullName || "Suggested user"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm font-semibold text-blue-500"
                >
                  Follow
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default SuggestedUsers;

import { Ban, BellOff, BellRing, Flag, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  blockUser,
  clearSafetyStatus,
  muteUser,
  unblockUser,
  unmuteUser,
} from "../safetySlice";
import ReportModal from "./ReportModal";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const ProfileSafetyMenu = ({ profile }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const { actionLoading } = useSelector((state) => state.safety);

  const [open, setOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isBlocked = currentUser?.blockedUsers?.some(
    (user) => getId(user) === profile?._id,
  );

  const isMuted = currentUser?.mutedUsers?.some(
    (user) => getId(user) === profile?._id,
  );

  const handleBlockToggle = async () => {
    if (!profile?._id) return;

    if (isBlocked) {
      await dispatch(unblockUser(profile._id));
    } else {
      await dispatch(blockUser(profile._id));
    }

    setOpen(false);
  };

  const handleMuteToggle = async () => {
    if (!profile?._id) return;

    if (isMuted) {
      await dispatch(unmuteUser(profile._id));
    } else {
      await dispatch(muteUser(profile._id));
    }

    setOpen(false);
  };

  const handleOpenReport = () => {
    dispatch(clearSafetyStatus());
    setOpen(false);
    setShowReportModal(true);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
        aria-label="Profile safety actions"
      >
        <MoreHorizontal size={20} />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={handleMuteToggle}
            disabled={actionLoading}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-slate-900"
          >
            {isMuted ? <BellRing size={18} /> : <BellOff size={18} />}
            {isMuted ? "Unmute user" : "Mute user"}
          </button>

          <button
            type="button"
            onClick={handleBlockToggle}
            disabled={actionLoading}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/30"
          >
            <Ban size={18} />
            {isBlocked ? "Unblock user" : "Block user"}
          </button>

          <button
            type="button"
            onClick={handleOpenReport}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Flag size={18} />
            Report user
          </button>
        </div>
      ) : null}

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={profile?._id}
        type="user"
      />
    </div>
  );
};

export default ProfileSafetyMenu;

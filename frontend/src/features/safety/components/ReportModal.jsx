import { X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearSafetyStatus,
  reportComment,
  reportPost,
  reportReel,
  reportUser,
} from "../safetySlice";

const REPORT_REASONS = [
  { label: "Spam", value: "spam" },
  { label: "Nudity", value: "nudity" },
  { label: "Hate speech", value: "hate_speech" },
  { label: "Violence", value: "violence" },
  { label: "Harassment", value: "harassment" },
  { label: "False information", value: "false_information" },
  { label: "Scam", value: "scam" },
  { label: "Other", value: "other" },
];

const getReportAction = ({ type, targetId, reason, description }) => {
  if (type === "user") {
    return reportUser({ userId: targetId, reason, description });
  }

  if (type === "post") {
    return reportPost({ postId: targetId, reason, description });
  }

  if (type === "reel") {
    return reportReel({ reelId: targetId, reason, description });
  }

  return reportComment({ commentId: targetId, reason, description });
};

const ReportModal = ({ open, onClose, targetId, type = "user" }) => {
  const dispatch = useDispatch();

  const { actionLoading, error, successMessage } = useSelector(
    (state) => state.safety,
  );

  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");

  if (!open) {
    return null;
  }

  const handleClose = () => {
    dispatch(clearSafetyStatus());
    setReason("spam");
    setDescription("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!targetId) return;

    const result = await dispatch(
      getReportAction({
        type,
        targetId,
        reason,
        description: description.trim(),
      }),
    );

    if (
      reportUser.fulfilled.match(result) ||
      reportPost.fulfilled.match(result) ||
      reportReel.fulfilled.match(result) ||
      reportComment.fulfilled.match(result)
    ) {
      setReason("spam");
      setDescription("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-950"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Report {type}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Close report modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {error ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {successMessage}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="reportReason"
              className="text-sm font-semibold text-slate-950 dark:text-white"
            >
              Reason
            </label>

            <select
              id="reportReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reportDescription"
              className="text-sm font-semibold text-slate-950 dark:text-white"
            >
              Description
            </label>

            <textarea
              id="reportDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Optional details..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {actionLoading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportModal;

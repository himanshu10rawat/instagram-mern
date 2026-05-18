import { X } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";

import Button from "../../../components/ui/Button";
import { updatePostCaption } from "../postSlice";

const EditCaptionModal = ({ post, onClose }) => {
  const dispatch = useDispatch();
  const [caption, setCaption] = useState(post?.caption || "");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      updatePostCaption({
        postId: post._id,
        caption: caption.trim(),
      }),
    );

    if (updatePostCaption.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Edit Caption
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={5}
            placeholder="Write a caption..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white"
          />

          <Button type="submit">Save Caption</Button>
        </form>
      </div>
    </div>
  );
};

export default EditCaptionModal;

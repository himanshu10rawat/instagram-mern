import { useState } from "react";
import { useDispatch } from "react-redux";

import Button from "../../../components/ui/Button";
import ModalShell from "../../../components/ui/ModalShell";
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
    <ModalShell
      title="Edit Caption"
      onClose={onClose}
      className="max-w-lg"
      contentClassName="p-4 sm:p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={5}
          placeholder="Write a caption..."
          className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white"
        />

        <Button type="submit">Save Caption</Button>
      </form>
    </ModalShell>
  );
};

export default EditCaptionModal;

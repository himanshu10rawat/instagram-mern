import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ModalShell from "../../../components/ui/ModalShell";
import {
  clearCollectionStatus,
  createCollection,
  updateCollection,
} from "../collectionSlice";

const CollectionFormContent = ({ collection = null, onClose }) => {
  const dispatch = useDispatch();

  const { actionLoading, error } = useSelector((state) => state.collections);

  const [name, setName] = useState(() => collection?.name || "");
  const [description, setDescription] = useState(
    () => collection?.description || "",
  );

  const isEditMode = Boolean(collection?._id);

  useEffect(() => {
    dispatch(clearCollectionStatus());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    const result = isEditMode
      ? await dispatch(
          updateCollection({
            collectionId: collection._id,
            payload,
          }),
        )
      : await dispatch(createCollection(payload));

    if (
      createCollection.fulfilled.match(result) ||
      updateCollection.fulfilled.match(result)
    ) {
      onClose();
    }
  };

  return (
    <ModalShell
      title={isEditMode ? "Edit Collection" : "Create Collection"}
      onClose={onClose}
      className="max-w-md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4"
      >
        {error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <Input
          label="Collection name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Travel, Coding, Food..."
        />

        <div>
          <label
            htmlFor="collectionDescription"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description
          </label>

          <textarea
            id="collectionDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Optional description..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <Button type="submit" disabled={actionLoading || !name.trim()}>
          {actionLoading
            ? "Saving..."
            : isEditMode
              ? "Update Collection"
              : "Create Collection"}
        </Button>
      </form>
    </ModalShell>
  );
};

const CollectionFormModal = ({ collection = null, onClose, open }) => {
  if (!open) {
    return null;
  }

  return (
    <CollectionFormContent
      key={collection?._id || "new-collection"}
      collection={collection}
      onClose={onClose}
    />
  );
};

export default CollectionFormModal;

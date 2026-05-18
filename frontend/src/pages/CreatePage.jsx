import { Image, Video, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  clearCreateStatus,
  createPost,
  createReel,
  createStory,
} from "../features/create/createSlice";

const createTypes = [
  {
    label: "Post",
    value: "post",
    icon: Image,
  },
  {
    label: "Story",
    value: "story",
    icon: PlusCircle,
  },
  {
    label: "Reel",
    value: "reel",
    icon: Video,
  },
];

const CreatePage = () => {
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector(
    (state) => state.create,
  );

  const [createType, setCreateType] = useState("post");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const isReel = createType === "reel";
  const isStory = createType === "story";
  const isPost = createType === "post";

  const acceptType = useMemo(() => {
    if (isReel) return "video/*";
    if (isStory) return "image/*,video/*";
    return "image/*,video/*";
  }, [isReel, isStory]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const resetForm = () => {
    setCaption("");
    setLocation("");
    setVisibility("public");
    setFiles([]);

    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const handleTypeChange = (type) => {
    setCreateType(type);
    resetForm();
    dispatch(clearCreateStatus());
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (isReel && selectedFiles.length > 1) {
      return;
    }

    if (isStory && selectedFiles.length > 1) {
      return;
    }

    setFiles(selectedFiles);

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    dispatch(clearCreateStatus());
  };

  const buildPostFormData = () => {
    const formData = new FormData();

    formData.append("caption", caption);
    formData.append("location", location);

    files.forEach((file) => {
      formData.append("media", file);
    });

    return formData;
  };

  const buildStoryFormData = () => {
    const formData = new FormData();

    formData.append("caption", caption);
    formData.append("visibility", visibility);

    if (files[0]) {
      formData.append("media", files[0]);
    }

    return formData;
  };

  const buildReelFormData = () => {
    const formData = new FormData();

    formData.append("caption", caption);
    formData.append("location", location);

    if (files[0]) {
      formData.append("video", files[0]);
    }

    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (files.length === 0) {
      return;
    }

    let result;

    if (isPost) {
      result = await dispatch(createPost(buildPostFormData()));
    }

    if (isStory) {
      result = await dispatch(createStory(buildStoryFormData()));
    }

    if (isReel) {
      result = await dispatch(createReel(buildReelFormData()));
    }

    if (
      createPost.fulfilled.match(result) ||
      createStory.fulfilled.match(result) ||
      createReel.fulfilled.match(result)
    ) {
      resetForm();
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Create</h1>
        <p className="mt-2 text-slate-500">Create post, reel or story.</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {createTypes.map((item) => {
            const Icon = item.icon;
            const isActive = createType === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleTypeChange(item.value)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${isActive ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Upload {createType}
            </label>

            <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:bg-slate-100">
              <input
                type="text"
                accept={acceptType}
                multiple={isPost}
                onChange={handleFileChange}
                className="hidden"
              />

              <PlusCircle size={36} className="text-slate-500" />

              <p className="mt-3 text-sm font-medium text-slate-800">
                Click to upload
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {isPost
                  ? "Post supports multiple images/videos"
                  : "Story and reel support single media"}
              </p>
            </label>
          </div>

          {previewUrls.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {previewUrls.map((url, index) => {
                const file = files[index];
                const isVideo = file?.type?.startsWith("video/");

                return (
                  <div
                    key={url}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        controls
                        className="h-72 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={url}
                        alt="Preview"
                        className="h-72 w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="caption"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Caption
            </label>

            <textarea
              id="caption"
              value={caption}
              onChange={(event) => {
                setCaption(event.target.value);
                dispatch(clearCreateStatus());
              }}
              placeholder="Write a caption..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          {!isStory ? (
            <Input
              label={"Location"}
              name={"location"}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={"Add location"}
            />
          ) : null}

          {isStory ? (
            <div>
              <label
                htmlFor="visibility"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Story visibility
              </label>

              <select
                id="visibility"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="close_friends">Close Friends</option>
              </select>
            </div>
          ) : null}

          <Button type="submit" disabled={loading || files.length === 0}>
            {loading ? "Publishing..." : `Publish ${createType}`}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default CreatePage;

import { Image, Plus, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import MediaPreviewFallback from "../components/common/MediaPreviewFallback";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  clearCreateStatus,
  createPost,
  createReel,
  createStory,
} from "../features/create/createSlice";
import { fetchStoriesFeed } from "../features/stories/storySlice";
import { FORM_DATA_FIELDS } from "../constants/apiRoutes";
import {
  canPreviewImageFile,
  getFileTypeLabel,
} from "../utils/mediaPreview";

const contentTypes = [
  {
    label: "Post",
    value: "post",
    icon: Image,
  },
  {
    label: "Reel",
    value: "reel",
    icon: Video,
  },
  {
    label: "Story",
    value: "story",
    icon: Plus,
  },
];

const maxUploadSizeMb = 5;
const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;

const uploadRules = {
  post: {
    maxFiles: 10,
    allowedKinds: ["image", "video"],
    emptyMessage: "Choose at least one image or video before publishing a post.",
    typeMessage:
      "Posts support JPG, PNG, WEBP, GIF, AVIF, HEIC, HEIF, MP4, WEBM and MOV files.",
  },
  reel: {
    maxFiles: 1,
    allowedKinds: ["video"],
    emptyMessage: "Choose one video before publishing a reel.",
    typeMessage: "Reels support video files only: MP4, WEBM or MOV.",
  },
  story: {
    maxFiles: 1,
    allowedKinds: ["image", "video"],
    emptyMessage: "Choose one image or video before publishing a story.",
    typeMessage:
      "Stories support JPG, PNG, WEBP, GIF, AVIF, HEIC, HEIF, MP4, WEBM and MOV files.",
  },
};

const fileTypeLabels = {
  image: "image",
  video: "video",
};

const allowedMimeTypes = {
  image: new Set([
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/heic",
    "image/heif",
  ]),
  video: new Set(["video/mp4", "video/webm", "video/quicktime"]),
};

const allowedExtensions = {
  image: ["jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "heif"],
  video: ["mp4", "webm", "mov"],
};

const getInitialType = (type) => {
  if (["post", "reel", "story"].includes(type)) {
    return type;
  }

  return "post";
};

const getFileExtension = (fileName = "") => {
  const parts = fileName.toLowerCase().split(".");

  return parts.length > 1 ? parts.at(-1) : "";
};

const getFileKind = (file) => {
  const extension = getFileExtension(file.name);

  if (
    allowedMimeTypes.image.has(file.type) ||
    allowedExtensions.image.includes(extension)
  ) {
    return "image";
  }

  if (
    allowedMimeTypes.video.has(file.type) ||
    allowedExtensions.video.includes(extension)
  ) {
    return "video";
  }

  return "";
};

const getFileId = (file, index = 0) =>
  `${file.name}-${file.lastModified}-${file.size}-${index}`;

const readFileAsDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });

    reader.addEventListener("error", () => {
      resolve("");
    });

    reader.readAsDataURL(file);
  });
};

const createFilePreview = async (file, index) => {
  const kind = getFileKind(file);
  const canPreview = kind !== "image" || canPreviewImageFile(file);
  const shouldUseDataUrl = kind === "image" && canPreview;
  const url = shouldUseDataUrl
    ? await readFileAsDataUrl(file)
    : URL.createObjectURL(file);

  return {
    canPreview,
    id: getFileId(file, index),
    kind,
    name: file.name,
    type: file.type,
    url,
    objectUrl: !shouldUseDataUrl,
    failed: shouldUseDataUrl && !url,
  };
};

const createFilePreviews = (selectedFiles) =>
  Promise.all(
    selectedFiles.map((file, index) => createFilePreview(file, index)),
  );

const revokeFilePreviews = (filePreviews) => {
  filePreviews.forEach((preview) => {
    if (preview.objectUrl && preview.url) {
      URL.revokeObjectURL(preview.url);
    }
  });
};

const formatFileSize = (size) => `${(size / 1024 / 1024).toFixed(1)} MB`;

const getSelectedFilesError = (selectedFiles, contentType) => {
  const rule = uploadRules[contentType];

  if (!selectedFiles.length) {
    return rule.emptyMessage;
  }

  if (selectedFiles.length > rule.maxFiles) {
    const label =
      contentType === "post"
        ? "Posts"
        : contentType === "reel"
          ? "Reels"
          : "Stories";

    return `${label} accept ${rule.maxFiles} file${
      rule.maxFiles > 1 ? "s" : ""
    }. You selected ${selectedFiles.length}.`;
  }

  const invalidSizeFile = selectedFiles.find(
    (file) => file.size > maxUploadSizeBytes,
  );

  if (invalidSizeFile) {
    return `${invalidSizeFile.name} is ${formatFileSize(
      invalidSizeFile.size,
    )}. Maximum allowed size is ${maxUploadSizeMb} MB per file.`;
  }

  const invalidTypeFile = selectedFiles.find((file) => {
    const kind = getFileKind(file);

    return !rule.allowedKinds.includes(kind);
  });

  if (invalidTypeFile) {
    const detectedType =
      invalidTypeFile.type ||
      (getFileExtension(invalidTypeFile.name)
        ? `.${getFileExtension(invalidTypeFile.name)} file`
        : "unknown file type");
    const allowedLabels = rule.allowedKinds
      .map((kind) => fileTypeLabels[kind])
      .join(" or ");

    return `${invalidTypeFile.name} was detected as ${detectedType}. For a ${contentType}, choose ${allowedLabels} media. ${rule.typeMessage}`;
  }

  return "";
};

const CreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const typeFromQuery = searchParams.get("type");

  const { loading, error, successMessage } = useSelector(
    (state) => state.create,
  );

  const [contentType, setContentType] = useState(() =>
    getInitialType(typeFromQuery),
  );
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [storyText, setStoryText] = useState("");
  const [isCloseFriends, setIsCloseFriends] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [previews, setPreviews] = useState([]);
  const isMountedRef = useRef(true);
  const previewRequestRef = useRef(0);
  const previewsRef = useRef([]);

  useEffect(() => {
    dispatch(clearCreateStatus());

    return () => {
      isMountedRef.current = false;
      previewRequestRef.current += 1;
      revokeFilePreviews(previewsRef.current);
      dispatch(clearCreateStatus());
    };
  }, [dispatch]);

  const replaceFiles = async (nextFiles) => {
    const requestId = previewRequestRef.current + 1;

    previewRequestRef.current = requestId;

    const nextPreviews = await createFilePreviews(nextFiles);

    if (!isMountedRef.current || previewRequestRef.current !== requestId) {
      revokeFilePreviews(nextPreviews);
      return;
    }

    revokeFilePreviews(previewsRef.current);
    previewsRef.current = nextPreviews;
    setFiles(nextFiles);
    setPreviews(nextPreviews);
  };

  const resetForm = () => {
    replaceFiles([]);
    setCaption("");
    setLocation("");
    setTags("");
    setStoryText("");
    setIsCloseFriends(false);
    setLocalError("");
  };

  const handleTypeChange = (value) => {
    setContentType(value);
    resetForm();
    dispatch(clearCreateStatus());
  };

  const setSelectedFiles = async (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles || []);
    const validationError = getSelectedFilesError(nextFiles, contentType);

    dispatch(clearCreateStatus());

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
    await replaceFiles(nextFiles);
  };

  const handleFilesChange = async (event) => {
    await setSelectedFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;

    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    await setSelectedFiles(Array.from(event.dataTransfer.files || []));
  };

  const removeFile = (fileId) => {
    setLocalError("");
    dispatch(clearCreateStatus());

    const indexToRemove = files.findIndex(
      (file, index) => getFileId(file, index) === fileId,
    );

    if (indexToRemove === -1) return;

    replaceFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const markPreviewFailed = (previewId) => {
    setPreviews((currentPreviews) =>
      currentPreviews.map((preview) =>
        preview.id === previewId ? { ...preview, failed: true } : preview,
      ),
    );
    previewsRef.current = previewsRef.current.map((preview) =>
      preview.id === previewId ? { ...preview, failed: true } : preview,
    );
  };

  const appendCommonPostFields = (formData, tagField = "tags") => {
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    if (location.trim()) {
      formData.append("location", location.trim());
    }

    if (tags.trim()) {
      formData.append(tagField, tags.trim());
    }
  };

  const buildPostFormData = () => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append(FORM_DATA_FIELDS.post.media, file);
    });

    appendCommonPostFields(formData);

    return formData;
  };

  const buildReelFormData = () => {
    const formData = new FormData();

    if (files[0]) {
      formData.append(FORM_DATA_FIELDS.reel.video, files[0]);
    }

    appendCommonPostFields(formData, "hashtags");

    return formData;
  };

  const buildStoryFormData = () => {
    const formData = new FormData();

    if (files[0]) {
      formData.append(FORM_DATA_FIELDS.story.media, files[0]);
    }

    if (storyText.trim()) {
      formData.append("caption", storyText.trim());
    }

    formData.append(
      "visibility",
      isCloseFriends ? "close_friends" : "public",
    );

    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!files.length) {
      setLocalError(uploadRules[contentType].emptyMessage);
      return;
    }

    const validationError = getSelectedFilesError(files, contentType);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");

    let result;

    if (contentType === "post") {
      result = await dispatch(createPost(buildPostFormData()));
    }

    if (contentType === "reel") {
      result = await dispatch(createReel(buildReelFormData()));
    }

    if (contentType === "story") {
      result = await dispatch(createStory(buildStoryFormData()));
    }

    const isSuccess =
      createPost.fulfilled.match(result) ||
      createReel.fulfilled.match(result) ||
      createStory.fulfilled.match(result);

    if (isSuccess) {
      resetForm();

      if (contentType === "post") {
        navigate("/");
      }

      if (contentType === "reel") {
        navigate("/reels");
      }

      if (contentType === "story") {
        await dispatch(fetchStoriesFeed({ force: true }));
        navigate("/");
      }
    }
  };

  const acceptType =
    contentType === "reel"
      ? "video/*"
      : contentType === "story"
        ? "image/*,video/*"
        : "image/*,video/*";

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Create
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Upload a post, reel or story.
        </p>
      </div>

      <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {contentTypes.map((item) => {
            const Icon = item.icon;
            const isActive = contentType === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleTypeChange(item.value)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {localError || error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {localError || error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
        >
          <div className="space-y-5">
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition lg:min-h-96 ${
                isDragging
                  ? "border-slate-950 bg-slate-50 dark:border-white dark:bg-slate-900"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <Plus size={32} className="text-slate-500" />

              <span className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                Select {contentType === "post" ? "media files" : "a media file"}
              </span>

              <span className="mt-1 text-xs text-slate-500">
                {contentType === "post"
                  ? "Tap to browse or drop images/videos here."
                  : contentType === "reel"
                    ? "Tap to browse or drop one video here."
                    : "Tap to browse, capture, or drop one story file."}
              </span>

              <input
                type="file"
                accept={acceptType}
                capture={contentType === "story" ? "environment" : undefined}
                multiple={contentType === "post"}
                onChange={handleFilesChange}
                className="hidden"
              />
            </label>

            {previews.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {previews.map((preview) => (
                  <div
                    key={preview.id}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900"
                  >
                    {preview.kind === "video" && !preview.failed ? (
                      <video
                        src={preview.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onLoadedData={(event) => {
                          const video = event.currentTarget;

                          if (
                            Number.isFinite(video.duration) &&
                            video.duration > 0
                          ) {
                            video.currentTime = Math.min(
                              0.1,
                              video.duration / 2,
                            );
                          }

                          video.play().catch(() => {});
                        }}
                        onError={() => markPreviewFailed(preview.id)}
                        className="h-full w-full object-cover"
                      />
                    ) : preview.canPreview && !preview.failed ? (
                      <img
                        src={preview.url}
                        alt={preview.name}
                        loading="lazy"
                        decoding="async"
                        onError={() => markPreviewFailed(preview.id)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MediaPreviewFallback
                        label={getFileTypeLabel(preview)}
                        message={
                          preview.canPreview
                            ? "Preview unavailable"
                            : "Browser preview unavailable"
                        }
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(preview.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                      aria-label="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            {contentType !== "story" ? (
              <>
                <div>
                  <label
                    htmlFor="caption"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Caption
                  </label>

                  <textarea
                    id="caption"
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    rows={4}
                    placeholder="Write a caption..."
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <Input
                  label="Location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Add location"
                />

                <Input
                  label="Tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="nature, travel, coding"
                />
              </>
            ) : (
              <>
                <Input
                  label="Story caption"
                  value={storyText}
                  onChange={(event) => setStoryText(event.target.value)}
                  placeholder="Add caption to story"
                />

                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <span>
                    <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                      Close friends
                    </span>

                    <span className="text-xs text-slate-500">
                      Show this story only to close friends.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={isCloseFriends}
                    onChange={(event) =>
                      setIsCloseFriends(event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>
              </>
            )}

            <Button type="submit" disabled={loading || files.length === 0}>
              {loading
                ? "Publishing..."
                : contentType === "post"
                  ? "Publish Post"
                  : contentType === "reel"
                    ? "Publish Reel"
                    : "Publish Story"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreatePage;

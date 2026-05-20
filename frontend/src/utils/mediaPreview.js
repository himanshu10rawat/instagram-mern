const browserUnsupportedImageMimeTypes = new Set(["image/heic", "image/heif"]);
const browserUnsupportedImageExtensions = new Set(["heic", "heif"]);

export const getFileExtension = (fileName = "") => {
  const parts = fileName.toLowerCase().split(".");

  return parts.length > 1 ? parts.at(-1) : "";
};

export const isVideoFile = (file = {}) => {
  const fileData = file || {};
  const extension = getFileExtension(fileData.name);

  return (
    fileData.type?.startsWith("video/") ||
    ["mp4", "webm", "mov"].includes(extension)
  );
};

export const canPreviewImageFile = (file = {}) => {
  const fileData = file || {};
  const extension = getFileExtension(fileData.name);

  return (
    !browserUnsupportedImageMimeTypes.has(fileData.type) &&
    !browserUnsupportedImageExtensions.has(extension)
  );
};

export const getFileTypeLabel = (file = {}) => {
  const fileData = file || {};
  const extension = getFileExtension(fileData.name);

  if (extension) return extension.toUpperCase();
  if (fileData.type) {
    return fileData.type.split("/").at(-1)?.toUpperCase() || "MEDIA";
  }

  return "MEDIA";
};

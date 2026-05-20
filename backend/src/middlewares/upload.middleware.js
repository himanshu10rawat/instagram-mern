import multer from "multer";

const storage = multer.memoryStorage();
const maxFileSizeMb = 5;

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

const imageExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "heic",
  "heif",
]);

const videoMimeTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const videoExtensions = new Set(["mp4", "webm", "mov"]);

const uploadRules = {
  avatar: {
    label: "Profile photo",
    allowedMimeTypes: imageMimeTypes,
    allowedExtensions: imageExtensions,
    allowedText: "Upload a JPG, PNG, WEBP, GIF, AVIF, HEIC or HEIF image.",
  },
  video: {
    label: "Reel video",
    allowedMimeTypes: videoMimeTypes,
    allowedExtensions: videoExtensions,
    allowedText: "Upload an MP4, WEBM or MOV video.",
  },
  media: {
    label: "Media file",
    allowedMimeTypes: new Set([...imageMimeTypes, ...videoMimeTypes]),
    allowedExtensions: new Set([...imageExtensions, ...videoExtensions]),
    allowedText:
      "Upload an image (JPG, PNG, WEBP, GIF, AVIF, HEIC, HEIF) or video (MP4, WEBM, MOV).",
  },
};

const getUploadRule = (fieldName) => uploadRules[fieldName] || uploadRules.media;

const getFileExtension = (fileName = "") => {
  const parts = fileName.toLowerCase().split(".");

  return parts.length > 1 ? parts.at(-1) : "";
};

const createUploadError = ({ message, details }) => {
  const error = new Error(message);

  error.statusCode = 400;
  error.errors = details ? [details] : [];

  return error;
};

const fileFilter = (_req, file, cb) => {
  const rule = getUploadRule(file.fieldname);
  const extension = getFileExtension(file.originalname);
  const isAllowedFile =
    rule.allowedMimeTypes.has(file.mimetype) ||
    rule.allowedExtensions.has(extension);

  if (!isAllowedFile) {
    const detectedType = file.mimetype || "unknown file type";
    const fileName = file.originalname || "Selected file";

    cb(
      createUploadError({
        message: `${rule.label}: unsupported file type`,
        details: `${fileName} was detected as ${detectedType}. ${rule.allowedText}`,
      }),
      false,
    );
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
});

import cloudinary from "../config/cloudinary.js";

export const getOptimizedImageUrl = (publicId, options = {}) => {
  const { width = 1080, height, crop = "limit", quality = "auto", format = "auto" } = options;

  return cloudinary.url(publicId, {
    resource_type: "image",
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: format,
      },
    ],
    secure: true,
  });
};

export const getOptimizedVideoUrl = (publicId, options = {}) => {
  const { quality = "auto", format = "mp4" } = options;

  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      {
        quality,
        fetch_format: format,
      },
    ],
    secure: true,
  });
};

export const getVideoThumbnailUrl = (publicId, options = {}) => {
  const { width = 720, height = 1280, crop = "fill", quality = "auto", format = "jpg" } = options;

  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: format,
        start_offset: "auto",
      },
    ],
    secure: true,
  });
};

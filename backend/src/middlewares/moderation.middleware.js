import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";
import { moderateText } from "../utils/moderation.js";

export const moderateBodyText = (fields = []) => {
  return (req, _res, next) => {
    const flaggedFields = [];

    fields.forEach((field) => {
      const value = req.body[field];

      if (!value) return;

      const moderation = moderateText(value);

      if (moderation.isFlagged) {
        flaggedFields.push({
          field,
          reasons: moderation.reasons,
        });
      }
    });

    if (flaggedFields.length > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Content violates community guidelines: ${flaggedFields
          .map((item) => `${item.field}(${item.reasons.join(",")})`)
          .join(", ")}`,
      );
    }

    next();
  };
};

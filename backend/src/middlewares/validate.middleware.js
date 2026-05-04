import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      next(new ApiError(HTTP_STATUS.BAD_REQUEST, "Validation failed", errors));
      return;
    }

    if (result.data.body) {
      req.body = result.data.body;
    }
    if (result.data.params) {
      req.params = result.data.params;
    }

    next();
  };
};

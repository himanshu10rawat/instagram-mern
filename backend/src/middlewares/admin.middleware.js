import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

export const isAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Admin access required");
  }

  next();
};

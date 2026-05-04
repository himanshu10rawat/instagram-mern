import { Router } from "express";

import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiResponse from "../utils/ApiResponse.js";

const router = Router();

router.get("/", (_req, res) => {
  res
    .status(HTTP_STATUS.Ok)
    .json(new ApiResponse(HTTP_STATUS.Ok, { uptime: process.uptime() }, "Server is healthy"));
});

export default router;

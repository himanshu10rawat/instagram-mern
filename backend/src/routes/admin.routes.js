import { Router } from "express";

import {
  blockUserByAdmin,
  getReports,
  removePostByAdmin,
  removeReelByAdmin,
  unblockUserByAdmin,
  updateReportStatus,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/reports", getReports);
router.patch("/reports/:reportId/status", updateReportStatus);

router.patch("/users/:userId/block", blockUserByAdmin);
router.patch("/users/:userId/unblock", unblockUserByAdmin);

router.delete("/posts/:postId", removePostByAdmin);
router.delete("/reels/:reelId", removeReelByAdmin);

export default router;

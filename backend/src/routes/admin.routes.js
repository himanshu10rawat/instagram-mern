import { Router } from "express";

import {
  blockUserByAdmin,
  deleteReport,
  getDashboardStats,
  getPosts,
  getReels,
  getReports,
  getUsers,
  removeCommentByAdmin,
  removePostByAdmin,
  removeReelByAdmin,
  unblockUserByAdmin,
  updateUserRoleByAdmin,
  updateReportStatus,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/posts", getPosts);
router.get("/reels", getReels);

router.get("/reports", getReports);
router.patch("/reports/:reportId/status", updateReportStatus);
router.delete("/reports/:reportId", deleteReport);

router.patch("/users/:userId/block", blockUserByAdmin);
router.patch("/users/:userId/unblock", unblockUserByAdmin);
router.patch("/users/:userId/role", updateUserRoleByAdmin);

router.delete("/posts/:postId", removePostByAdmin);
router.delete("/reels/:reelId", removeReelByAdmin);
router.delete("/comments/:commentId", removeCommentByAdmin);

export default router;

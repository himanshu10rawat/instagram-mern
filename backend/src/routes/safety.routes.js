import { Router } from "express";

import {
  blockUser,
  getBlockedUsers,
  getMutedUsers,
  muteUser,
  reportComment,
  reportPost,
  reportReel,
  reportUser,
  unblockUser,
  unmuteUser,
} from "../controllers/safety.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { reportSchema } from "../validators/report.validator.js";

const router = Router();

router.get("/blocked-users", isAuthenticated, getBlockedUsers);
router.get("/muted-users", isAuthenticated, getMutedUsers);

router.post("/block/:userId", isAuthenticated, blockUser);
router.delete("/block/:userId", isAuthenticated, unblockUser);

router.post("/mute/:userId", isAuthenticated, muteUser);
router.delete("/mute/:userId", isAuthenticated, unmuteUser);

router.post("/report/user/:userId", isAuthenticated, validate(reportSchema), reportUser);
router.post("/report/post/:postId", isAuthenticated, validate(reportSchema), reportPost);
router.post("/report/reel/:reelId", isAuthenticated, validate(reportSchema), reportReel);
router.post("/report/comment/:commentId", isAuthenticated, validate(reportSchema), reportComment);

export default router;

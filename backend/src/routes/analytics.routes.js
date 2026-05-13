import { Router } from "express";

import {
  getCreatorDashboardStats,
  getPostAnalytics,
  getProfileVisitsAnalytics,
  getReelAnalytics,
} from "../controllers/analytics.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/dashboard", isAuthenticated, getCreatorDashboardStats);
router.get("/profile-visits", isAuthenticated, getProfileVisitsAnalytics);

router.get("/posts/:postId", isAuthenticated, getPostAnalytics);
router.get("/reels/:reelId", isAuthenticated, getReelAnalytics);

export default router;

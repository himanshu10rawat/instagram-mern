import { Router } from "express";

import {
  getRecommendedPosts,
  getRecommendedReels,
  getSuggestedUsers,
} from "../controllers/recommendation.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", isAuthenticated, getSuggestedUsers);
router.get("/posts", isAuthenticated, getRecommendedPosts);
router.get("/reels", isAuthenticated, getRecommendedReels);

export default router;

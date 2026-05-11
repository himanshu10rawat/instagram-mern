import { Router } from "express";

import {
  getExploreFeed,
  getSuggestedUsers,
  getTrendingHashtags,
  getTrendingReels,
  searchHashtags,
  searchPosts,
  searchReels,
  searchUsers,
} from "../controllers/explore.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/search/users", isAuthenticated, searchUsers);
router.get("/search/posts", isAuthenticated, searchPosts);
router.get("/search/reels", isAuthenticated, searchReels);
router.get("/search/hashtags", isAuthenticated, searchHashtags);

router.get("/feed", isAuthenticated, getExploreFeed);

router.get("/trending/reels", isAuthenticated, getTrendingReels);
router.get("/trending/hashtags", isAuthenticated, getTrendingHashtags);

router.get("/suggested/users", isAuthenticated, getSuggestedUsers);

export default router;

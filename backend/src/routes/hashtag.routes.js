import { Router } from "express";

import {
  followHashtag,
  getHashtagDetails,
  getHashtagPosts,
  getHashtagReels,
  unfollowHashtag,
} from "../controllers/hashtag.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:name", isAuthenticated, getHashtagDetails);
router.get("/:name/posts", isAuthenticated, getHashtagPosts);
router.get("/:name/reels", isAuthenticated, getHashtagReels);

router.post("/:name/follow", isAuthenticated, followHashtag);
router.delete("/:name/follow", isAuthenticated, unfollowHashtag);

export default router;

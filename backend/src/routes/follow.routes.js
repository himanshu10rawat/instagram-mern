import { Router } from "express";

import {
  acceptFollowRequest,
  cancelFollowRequest,
  followUser,
  getFollowers,
  getFollowing,
  getReceivedFollowRequests,
  rejectFollowRequest,
  unfollowUser,
} from "../controllers/follow.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/requests/received", isAuthenticated, getReceivedFollowRequests);

router.get("/:userId/followers", isAuthenticated, getFollowers);
router.get("/:userId/following", isAuthenticated, getFollowing);

router.patch("/request/:requestId/accept", isAuthenticated, acceptFollowRequest);
router.patch("/request/:requestId/reject", isAuthenticated, rejectFollowRequest);
router.delete("/request/:userId", isAuthenticated, cancelFollowRequest);

router.post("/:userId", isAuthenticated, followUser);
router.delete("/:userId", isAuthenticated, unfollowUser);

export default router;

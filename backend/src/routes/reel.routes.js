import { Router } from "express";

import {
  addReelComment,
  createReel,
  deleteReel,
  deleteReelComment,
  getReelById,
  getReelComments,
  getReelsFeed,
  getUserReels,
  likeReel,
  saveReel,
  shareReel,
  unlikeReel,
  unsaveReel,
  updateReel,
  viewReel,
} from "../controllers/reel.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createReelSchema,
  reelCommentSchema,
  updateReelSchema,
} from "../validators/reel.validator.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { moderateBodyText } from "../middlewares/moderation.middleware.js";
import { blockDuplicateContent } from "../middlewares/duplicateContent.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getReelsFeed);
router.get("/user/:userId", isAuthenticated, getUserReels);

router.post(
  "/",
  isAuthenticated,
  upload.single("video"),
  validate(createReelSchema),
  moderateBodyText(["caption", "audioName", "location"]),
  createReel,
);

router.get("/:reelId", isAuthenticated, getReelById);
router.patch(
  "/:reelId",
  isAuthenticated,
  validate(updateReelSchema),
  moderateBodyText(["caption", "audioName", "location"]),
  updateReel,
);
router.delete("/:reelId", isAuthenticated, deleteReel);

router.post("/:reelId/view", isAuthenticated, viewReel);
router.post("/:reelId/share", isAuthenticated, shareReel);

router.post("/:reelId/like", isAuthenticated, likeReel);
router.delete("/:reelId/like", isAuthenticated, unlikeReel);

router.post("/:reelId/save", isAuthenticated, saveReel);
router.delete("/:reelId/save", isAuthenticated, unsaveReel);

router.post(
  "/:reelId/comments",
  isAuthenticated,
  rateLimiter({ keyPrefix: "reel-comment", limit: 10, windowSeconds: 60 }),
  validate(reelCommentSchema),
  moderateBodyText(["text"]),
  blockDuplicateContent({ field: "text", keyPrefix: "reel-comment-duplicate" }),
  addReelComment,
);
router.get("/:reelId/comments", isAuthenticated, getReelComments);

router.delete("/comments/:commentId", isAuthenticated, deleteReelComment);

export default router;

import { Router } from "express";

import {
  createStory,
  deleteStory,
  getActiveStories,
  getStoryReplies,
  getStoryViewers,
  getUserStories,
  likeStory,
  replyToStory,
  unlikeStory,
  viewStory,
  archiveStory,
  getArchivedStories,
} from "../controllers/story.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createStorySchema, storyReplySchema } from "../validators/story.validator.js";
import { moderateBodyText } from "../middlewares/moderation.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getActiveStories);
router.get("/user/:userId", isAuthenticated, getUserStories);

router.post(
  "/",
  isAuthenticated,
  upload.single("media"),
  validate(createStorySchema),
  moderateBodyText(["caption"]),
  createStory,
);

router.post("/:storyId/like", isAuthenticated, likeStory);
router.delete("/:storyId/like", isAuthenticated, unlikeStory);

router.post(
  "/:storyId/reply",
  isAuthenticated,
  validate(storyReplySchema),
  moderateBodyText(["text"]),
  replyToStory,
);
router.get("/:storyId/replies", isAuthenticated, getStoryReplies);

router.get("/:storyId/viewers", isAuthenticated, getStoryViewers);
router.get("/:storyId", isAuthenticated, viewStory);
router.delete("/:storyId", isAuthenticated, deleteStory);
router.get("/archive", isAuthenticated, getArchivedStories);
router.patch("/:storyId/archive", isAuthenticated, archiveStory);

export default router;

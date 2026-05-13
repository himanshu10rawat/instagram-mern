import { Router } from "express";
import {
  addComment,
  archivePost,
  createPost,
  deleteComment,
  deletePost,
  getFeedPosts,
  getMyArchivedPosts,
  getMySavedPosts,
  getPostById,
  getPostComments,
  getUserPosts,
  likePost,
  savePost,
  unarchivePost,
  unlikePost,
  unsavePost,
  updatePost,
} from "../controllers/post.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { commentSchema, createPostSchema, updatePostSchema } from "../validators/post.validator.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { moderateBodyText } from "../middlewares/moderation.middleware.js";
import { blockDuplicateContent } from "../middlewares/duplicateContent.middleware.js";
import { removeTagFromPost } from "../controllers/post.controller.js";

const router = Router();

router.get("/feed", isAuthenticated, getFeedPosts);
router.get("/saved", isAuthenticated, getMySavedPosts);
router.get("/archived", isAuthenticated, getMyArchivedPosts);
router.get("/user/:userId", isAuthenticated, getUserPosts);

router.post(
  "/",
  isAuthenticated,
  upload.array("media", 10),
  validate(createPostSchema),
  moderateBodyText(["caption", "location"]),
  createPost,
);

router.get("/:postId", isAuthenticated, getPostById);
router.patch(
  "/:postId",
  isAuthenticated,
  validate(updatePostSchema),
  moderateBodyText(["caption", "location"]),
  updatePost,
);
router.delete("/:postId", isAuthenticated, deletePost);

router.patch("/:postId/archive", isAuthenticated, archivePost);
router.patch("/:postId/unarchive", isAuthenticated, unarchivePost);

router.post("/:postId/like", isAuthenticated, likePost);
router.delete("/:postId/like", isAuthenticated, unlikePost);

router.post("/:postId/save", isAuthenticated, savePost);
router.delete("/:postId/save", isAuthenticated, unsavePost);

router.post(
  "/:postId/comments",
  isAuthenticated,
  rateLimiter({ keyPrefix: "post-comment", limit: 10, windowSeconds: 60 }),
  validate(commentSchema),
  moderateBodyText(["text"]),
  blockDuplicateContent({ field: "text", keyPrefix: "post-comment-duplicate" }),
  addComment,
);
router.get("/:postId/comments", isAuthenticated, getPostComments);

router.delete("/comments/:commentId", isAuthenticated, deleteComment);
router.patch("/:postId/remove-tag", isAuthenticated, removeTagFromPost);

export default router;

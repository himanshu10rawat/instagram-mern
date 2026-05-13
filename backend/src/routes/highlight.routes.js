import { Router } from "express";

import {
  addStoryToHighlight,
  createHighlight,
  deleteHighlight,
  getMyHighlights,
  getUserHighlights,
  removeStoryFromHighlight,
  updateHighlight,
} from "../controllers/highlight.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createHighlightSchema,
  highlightStorySchema,
  updateHighlightSchema,
} from "../validators/highlight.validator.js";

const router = Router();

router.post("/", isAuthenticated, validate(createHighlightSchema), createHighlight);
router.get("/me", isAuthenticated, getMyHighlights);
router.get("/user/:userId", isAuthenticated, getUserHighlights);

router.patch("/:highlightId", isAuthenticated, validate(updateHighlightSchema), updateHighlight);
router.delete("/:highlightId", isAuthenticated, deleteHighlight);

router.post(
  "/:highlightId/stories",
  isAuthenticated,
  validate(highlightStorySchema),
  addStoryToHighlight,
);

router.delete(
  "/:highlightId/stories",
  isAuthenticated,
  validate(highlightStorySchema),
  removeStoryFromHighlight,
);

export default router;

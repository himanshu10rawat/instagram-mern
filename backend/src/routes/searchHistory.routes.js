import { Router } from "express";

import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  getRecentSearches,
  saveSearchHistory,
} from "../controllers/searchHistory.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { saveSearchSchema } from "../validators/searchHistory.validator.js";

const router = Router();

router.post("/", isAuthenticated, validate(saveSearchSchema), saveSearchHistory);
router.get("/", isAuthenticated, getRecentSearches);
router.delete("/clear", isAuthenticated, clearSearchHistory);
router.delete("/:searchId", isAuthenticated, deleteSearchHistoryItem);

export default router;

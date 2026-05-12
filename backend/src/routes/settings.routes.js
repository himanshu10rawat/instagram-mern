import { Router } from "express";

import {
  getSettings,
  updateLanguage,
  updateNotificationPreferences,
  updatePrivacyPreferences,
  updateTheme,
} from "../controllers/settings.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateLanguageSchema,
  updateNotificationPreferencesSchema,
  updatePrivacyPreferencesSchema,
  updateThemeSchema,
} from "../validators/settings.validator.js";

const router = Router();

router.get("/", isAuthenticated, getSettings);

router.patch("/theme", isAuthenticated, validate(updateThemeSchema), updateTheme);
router.patch("/language", isAuthenticated, validate(updateLanguageSchema), updateLanguage);

router.patch(
  "/notifications",
  isAuthenticated,
  validate(updateNotificationPreferencesSchema),
  updateNotificationPreferences,
);

router.patch(
  "/privacy",
  isAuthenticated,
  validate(updatePrivacyPreferencesSchema),
  updatePrivacyPreferences,
);

export default router;

import { Router } from "express";

import {
  getMyProfile,
  getPublicProfile,
  softDeleteAccount,
  updateAvatar,
  updateCoverImage,
  updatePrivacySettings,
  updateProfile,
} from "../controllers/profile.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  softDeleteAccountSchema,
  updatePrivacySettingsSchema,
  updateProfileSchema,
} from "../validators/profile.validator.js";
import { upload } from "../middlewares/upload.middleware.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", isAuthenticated, getMyProfile);
router.get("/:username", optionalAuth, getPublicProfile);

router.patch("/me", isAuthenticated, validate(updateProfileSchema), updateProfile);
router.patch(
  "/me/privacy",
  isAuthenticated,
  validate(updatePrivacySettingsSchema),
  updatePrivacySettings,
);

router.delete("/me", isAuthenticated, validate(softDeleteAccountSchema), softDeleteAccount);

router.patch("/me/avatar", isAuthenticated, upload.single("avatar"), updateAvatar);
router.patch("/me/cover", isAuthenticated, upload.single("coverImage"), updateCoverImage);

export default router;

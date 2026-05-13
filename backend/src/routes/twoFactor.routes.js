import { Router } from "express";

import {
  disableTwoFactor,
  enableTwoFactor,
  regenerateBackupCodes,
  setupTwoFactor,
  verifyBackupCode,
} from "../controllers/twoFactor.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { backupCodeSchema, verifyTwoFactorSchema } from "../validators/twoFactor.validator.js";

const router = Router();

router.post("/setup", isAuthenticated, setupTwoFactor);
router.post("/enable", isAuthenticated, validate(verifyTwoFactorSchema), enableTwoFactor);
router.post("/disable", isAuthenticated, validate(verifyTwoFactorSchema), disableTwoFactor);
router.post(
  "/backup-codes/regenerate",
  isAuthenticated,
  validate(verifyTwoFactorSchema),
  regenerateBackupCodes,
);
router.post("/backup-code/verify", isAuthenticated, validate(backupCodeSchema), verifyBackupCode);

export default router;

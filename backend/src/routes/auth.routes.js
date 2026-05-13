import { Router } from "express";

import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { resendEmailVerification, verifyEmail } from "../controllers/auth.controller.js";
import { verifyLoginTwoFactor } from "../controllers/auth.controller.js";
import { verifyLoginTwoFactorSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post(
  "/login",
  rateLimiter({ keyPrefix: "login", limit: 5, windowSeconds: 60 }),
  validate(loginSchema),
  login,
);

router.post("/refresh-token", refreshAccessToken);

router.get("/me", isAuthenticated, getCurrentUser);
router.post("/logout", isAuthenticated, logout);

router.post(
  "/forgot-password",
  rateLimiter({ keyPrefix: "forgot-password", limit: 3, windowSeconds: 300 }),
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.post("/change-password", isAuthenticated, validate(changePasswordSchema), changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-email-verification", isAuthenticated, resendEmailVerification);
router.post("/verify-2fa-login", validate(verifyLoginTwoFactorSchema), verifyLoginTwoFactor);

export default router;

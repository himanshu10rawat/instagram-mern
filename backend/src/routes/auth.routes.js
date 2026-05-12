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

export default router;

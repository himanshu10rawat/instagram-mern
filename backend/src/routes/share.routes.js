import { Router } from "express";

import { shareToUser } from "../controllers/share.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { moderateBodyText } from "../middlewares/moderation.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { shareToUserSchema } from "../validators/share.validator.js";

const router = Router();

router.post(
  "/to-user",
  isAuthenticated,
  validate(shareToUserSchema),
  moderateBodyText(["text"]),
  shareToUser,
);

export default router;

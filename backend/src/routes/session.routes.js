import { Router } from "express";

import {
  getMySessions,
  revokeAllSessions,
  revokeSession,
} from "../controllers/session.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getMySessions);
router.patch("/revoke-all", isAuthenticated, revokeAllSessions);
router.patch("/:sessionId/revoke", isAuthenticated, revokeSession);

export default router;

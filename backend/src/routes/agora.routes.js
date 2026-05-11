import { Router } from "express";

import { generateRtcToken } from "../controllers/agora.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/rtc-token", isAuthenticated, generateRtcToken);

export default router;

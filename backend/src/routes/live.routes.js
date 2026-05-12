import { Router } from "express";

import { endLive, getActiveLives, joinLive, startLive } from "../controllers/live.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", isAuthenticated, startLive);

router.get("/", isAuthenticated, getActiveLives);

router.post("/:liveId/join", isAuthenticated, joinLive);

router.patch("/:liveId/end", isAuthenticated, endLive);

export default router;

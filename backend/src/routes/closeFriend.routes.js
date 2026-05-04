import { Router } from "express";

import {
  addCloseFriend,
  getCloseFriends,
  removeCloseFriend,
} from "../controllers/closeFriend.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getCloseFriends);
router.post("/:userId", isAuthenticated, addCloseFriend);
router.delete("/:userId", isAuthenticated, removeCloseFriend);

export default router;

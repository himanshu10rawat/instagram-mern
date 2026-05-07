import { Router } from "express";

import {
  deleteNotification,
  getNotifications,
  markAllRead,
  markAsRead,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getNotifications);
router.patch("/read-all", isAuthenticated, markAllRead);
router.patch("/:notificationId/read", isAuthenticated, markAsRead);
router.delete("/:notificationId", isAuthenticated, deleteNotification);

export default router;

import { Router } from "express";

import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getNotifications);
router.patch("/read-all", isAuthenticated, markAllAsRead);
router.patch("/:notificationId/read", isAuthenticated, markAsRead);
router.delete("/:notificationId", isAuthenticated, deleteNotification);

export default router;

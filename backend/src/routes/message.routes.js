import { Router } from "express";

import {
  deleteConversationForMe,
  deleteMessageForEveryone,
  deleteMessageForMe,
  getConversations,
  getMessages,
  markConversationAsSeen,
  sendMessage,
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sendMessageSchema } from "../validators/message.validator.js";

const router = Router();

router.get("/conversations", isAuthenticated, getConversations);

router.post(
  "/:receiverId",
  isAuthenticated,
  upload.single("media"),
  validate(sendMessageSchema),
  sendMessage,
);

router.get("/conversation/:conversationId", isAuthenticated, getMessages);
router.patch("/conversation/:conversationId/seen", isAuthenticated, markConversationAsSeen);
router.delete("/conversation/:conversationId", isAuthenticated, deleteConversationForMe);

router.delete("/:messageId/me", isAuthenticated, deleteMessageForMe);
router.delete("/:messageId/everyone", isAuthenticated, deleteMessageForEveryone);

export default router;

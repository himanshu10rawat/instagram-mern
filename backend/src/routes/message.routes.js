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
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { moderateBodyText } from "../middlewares/moderation.middleware.js";
import { blockDuplicateContent } from "../middlewares/duplicateContent.middleware.js";

const router = Router();

router.get("/conversations", isAuthenticated, getConversations);

router.post(
  "/:receiverId",
  isAuthenticated,
  rateLimiter({ keyPrefix: "send-message", limit: 30, windowSeconds: 60 }),
  upload.single("media"),
  validate(sendMessageSchema),
  moderateBodyText(["text"]),
  blockDuplicateContent({ field: "text", keyPrefix: "message-duplicate", ttlSeconds: 60 }),
  sendMessage,
);

router.get("/conversation/:conversationId", isAuthenticated, getMessages);
router.patch("/conversation/:conversationId/seen", isAuthenticated, markConversationAsSeen);
router.delete("/conversation/:conversationId", isAuthenticated, deleteConversationForMe);

router.delete("/:messageId/me", isAuthenticated, deleteMessageForMe);
router.delete("/:messageId/everyone", isAuthenticated, deleteMessageForEveryone);

export default router;

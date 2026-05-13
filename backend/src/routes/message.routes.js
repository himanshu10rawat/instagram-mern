import { Router } from "express";

import {
  acceptMessageRequest,
  deleteConversationForMe,
  deleteMessageForEveryone,
  deleteMessageForMe,
  editMessage,
  forwardMessage,
  getConversations,
  getMessageRequests,
  getMessages,
  markConversationAsSeen,
  reactToMessage,
  rejectMessageRequest,
  removeMessageReaction,
  sendMessage,
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sendMessageSchema } from "../validators/message.validator.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { moderateBodyText } from "../middlewares/moderation.middleware.js";
import { blockDuplicateContent } from "../middlewares/duplicateContent.middleware.js";
import {
  editMessageSchema,
  forwardMessageSchema,
  reactMessageSchema,
} from "../validators/messageAdvanced.validator.js";

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
router.get("/requests", isAuthenticated, getMessageRequests);

router.patch("/requests/:conversationId/accept", isAuthenticated, acceptMessageRequest);

router.patch("/requests/:conversationId/reject", isAuthenticated, rejectMessageRequest);

router.patch("/:messageId/react", isAuthenticated, validate(reactMessageSchema), reactToMessage);

router.delete("/:messageId/react", isAuthenticated, removeMessageReaction);

router.patch("/:messageId/edit", isAuthenticated, validate(editMessageSchema), editMessage);

router.post("/:messageId/forward", isAuthenticated, validate(forwardMessageSchema), forwardMessage);

export default router;

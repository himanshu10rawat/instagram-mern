import { z } from "zod";

export const reactMessageSchema = z.object({
  body: z.object({
    emoji: z.string().trim().min(1).max(10),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Message text is required").max(2000),
  }),
});

export const forwardMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().trim().min(1, "Receiver id is required"),
  }),
});

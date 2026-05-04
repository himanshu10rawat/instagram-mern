import { z } from "zod";

export const createStorySchema = z.object({
  body: z.object({
    caption: z.string().trim().max(300).optional(),
    visibility: z.enum(["public", "close_friends"]).optional(),
  }),
});

export const storyReplySchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Reply is required").max(500),
  }),
});

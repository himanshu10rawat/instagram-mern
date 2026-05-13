import { z } from "zod";

export const shareToUserSchema = z.object({
  body: z
    .object({
      receiverId: z.string().trim().min(1, "Receiver id is required"),
      postId: z.string().trim().optional(),
      reelId: z.string().trim().optional(),
      storyId: z.string().trim().optional(),
      profileId: z.string().trim().optional(),
      text: z.string().trim().max(500).optional(),
    })
    .refine((data) => data.postId || data.reelId || data.storyId || data.profileId, {
      message: "One share target is required",
    }),
});

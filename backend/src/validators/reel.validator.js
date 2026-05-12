import { z } from "zod";

export const createReelSchema = z.object({
  body: z.object({
    caption: z.string().trim().max(2200).optional(),
    audioName: z.string().trim().max(100).optional(),
    location: z.string().trim().max(100).optional(),
    hashtags: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return [];

        return value
          .split(",")
          .map((tag) => tag.trim().toLowerCase().replace("#", ""))
          .filter(Boolean);
      }),
  }),
});

export const updateReelSchema = z.object({
  body: z.object({
    caption: z.string().trim().max(2200).optional(),
    audioName: z.string().trim().max(100).optional(),
    location: z.string().trim().max(100).optional(),
    hashtags: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return undefined;

        return value
          .split(",")
          .map((tag) => tag.trim().toLowerCase().replace("#", ""))
          .filter(Boolean);
      }),
  }),
});

export const reelCommentSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Comment is required").max(1000),
    parentComment: z.string().optional(),
  }),
});

import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    caption: z.string().trim().max(2200).optional(),
    location: z.string().trim().max(100).optional(),
    tags: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return [];

        return value
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);
      }),
    taggedUsers: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return [];

        return value
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
      }),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Comment is required").max(1000),
    parentComment: z.string().optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    caption: z.string().trim().max(2200).optional(),
    location: z.string().trim().max(100).optional(),
    tags: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return undefined;

        return value
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);
      }),
    taggedUsers: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return [];

        return value
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
      }),
  }),
});

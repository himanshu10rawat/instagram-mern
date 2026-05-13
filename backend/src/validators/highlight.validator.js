import { z } from "zod";

export const createHighlightSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(50),
    storyIds: z.array(z.string().trim()).optional().default([]),
  }),
});

export const updateHighlightSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(50).optional(),
  }),
});

export const highlightStorySchema = z.object({
  body: z.object({
    storyId: z.string().trim().min(1, "Story id is required"),
  }),
});

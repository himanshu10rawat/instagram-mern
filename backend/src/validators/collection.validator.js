import { z } from "zod";

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Collection name is required").max(50),
    description: z.string().trim().max(200).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const updateCollectionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().max(200).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const addToCollectionSchema = z.object({
  body: z
    .object({
      postId: z.string().trim().optional(),
      reelId: z.string().trim().optional(),
    })
    .refine((data) => data.postId || data.reelId, {
      message: "postId or reelId is required",
    }),
});

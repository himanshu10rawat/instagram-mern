import { z } from "zod";

export const saveSearchSchema = z.object({
  body: z
    .object({
      searchType: z.enum(["user", "hashtag", "post", "reel", "text"]),
      query: z.string().trim().max(100).optional(),
      searchedUserId: z.string().trim().optional(),
      hashtag: z.string().trim().max(50).optional(),
    })
    .refine((data) => data.query || data.searchedUserId || data.hashtag, {
      message: "query, searchedUserId or hashtag is required",
    }),
});

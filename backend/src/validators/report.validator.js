import { z } from "zod";

export const reportSchema = z.object({
  body: z.object({
    reason: z.enum([
      "spam",
      "nudity",
      "hate_speech",
      "violence",
      "harassment",
      "false_information",
      "scam",
      "other",
    ]),
    description: z.string().trim().max(500).optional(),
  }),
});

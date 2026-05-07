import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    text: z.string().trim().max(2000).optional(),
  }),
});

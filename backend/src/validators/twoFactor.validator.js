import { z } from "zod";

export const verifyTwoFactorSchema = z.object({
  body: z.object({
    token: z.string().trim().min(6).max(10),
  }),
});

export const backupCodeSchema = z.object({
  body: z.object({
    backupCode: z.string().trim().min(6).max(20),
  }),
});

import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(60).optional(),
    bio: z.string().trim().max(150).optional(),
    website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
    location: z.string().trim().max(80).optional(),
    profession: z.string().trim().max(80).optional(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    accountType: z.enum(["Personal", "creator", "business"]).optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.string().trim().min(2).max(10).optional(),
    links: z
      .array(
        z.object({
          label: z.string().trim().max(30),
          url: z.string().trim().url("Invalid link URL"),
        }),
      )
      .max(5)
      .optional(),
  }),
});

export const updatePrivacySettingsSchema = z.object({
  body: z.object({
    isPrivate: z.boolean().optional(),
    showActivityStatus: z.boolean().optional(),
    allowMessagesFrom: z.enum(["everyone", "followers", "none"]).optional(),
    allowTagsFrom: z.enum(["everyone", "followers", "none"]),
    allowMentionsFrom: z.enum(["everyone", "followers", "none"]).optional(),
  }),
});

export const softDeleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required"),
  }),
});

import { z } from "zod";

export const updateThemeSchema = z.object({
  body: z.object({
    theme: z.enum(["light", "dark", "system"]),
  }),
});

export const updateLanguageSchema = z.object({
  body: z.object({
    language: z.string().trim().min(2).max(10),
  }),
});

export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    likes: z.boolean().optional(),
    comments: z.boolean().optional(),
    follows: z.boolean().optional(),
    messages: z.boolean().optional(),
    mentions: z.boolean().optional(),
    stories: z.boolean().optional(),
  }),
});

export const updatePrivacyPreferencesSchema = z.object({
  body: z.object({
    isPrivate: z.boolean().optional(),
    showActivityStatus: z.boolean().optional(),
    allowMessagesFrom: z.enum(["everyone", "followers", "none"]).optional(),
    allowTagsFrom: z.enum(["everyone", "followers", "none"]).optional(),
    allowMentionsFrom: z.enum(["everyone", "followers", "none"]).optional(),
  }),
});

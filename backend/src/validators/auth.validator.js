import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(
          /^[a-zA-Z0-9._]+$/,
          "Username can only contain letters, numbers, dots and underscores",
        )
        .transform((value) => value.toLowerCase()),

      fullName: z
        .string()
        .trim()
        .min(2, "Full name is required")
        .max(60, "Full name cannot exceed 60 characters"),

      email: z
        .string()
        .trim()
        .email("Invalid email address")
        .transform((value) => value.toLowerCase())
        .optional(),

      phoneNumber: z
        .string()
        .trim()
        .regex(/^[0-9]{10,15}$/, "Invalid phone number")
        .optional(),

      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password cannot exceed 64 characters"),

      dateOfBirth: z.coerce.date({
        error: "Date of birth is required",
      }),

      gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),

      accountType: z.enum(["personal", "creator", "business"]).optional(),
    })
    .refine((data) => data.email || data.phoneNumber, {
      message: "Either email or phone number is required",
    }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, "Email, username or phone number is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, "Email, username or phone number is required"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, "Password must be at least 8 characters").max(64),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(64),
  }),
});

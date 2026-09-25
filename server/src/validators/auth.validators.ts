import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  mobile: z.string().min(8).max(15),
  password: z.string().min(8).max(100),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().length(6),
  purpose: z.enum(["REGISTRATION_MOBILE", "REGISTRATION_EMAIL", "LOGIN", "PASSWORD_RESET"]),
});

export const resendOtpSchema = z.object({
  identifier: z.string().min(3),
  purpose: z.enum(["REGISTRATION_MOBILE", "REGISTRATION_EMAIL", "LOGIN", "PASSWORD_RESET"]),
});

export const loginSchema = z.object({
  identifier: z.string().min(3), // email or mobile
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(100),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(3),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

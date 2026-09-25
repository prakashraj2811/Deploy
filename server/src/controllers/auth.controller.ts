import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { created, ok } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as authService from "../services/auth.service";
import { REFRESH_EXPIRY_DAYS } from "../services/auth.service";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/v1/auth",
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  created(res, result, "Registered successfully. Verify your email and mobile to continue.");
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body);
  ok(res, result, "Verified successfully");
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendOtp(req.body);
  ok(res, result, "Verification code sent");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login({
    ...req.body,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  setRefreshCookie(res, result.refreshToken);
  ok(res, {
    accessToken: result.accessToken,
    userId: result.userId,
    roles: result.roles,
    permissions: result.permissions,
  }, "Logged in successfully");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body.refreshToken;
  if (!token) throw ApiError.unauthorized("Missing refresh token", "REFRESH_MISSING");

  const result = await authService.refresh(token, { userAgent: req.headers["user-agent"], ipAddress: req.ip });
  setRefreshCookie(res, result.refreshToken);
  ok(res, {
    accessToken: result.accessToken,
    roles: result.roles,
    permissions: result.permissions,
  }, "Token refreshed");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body.refreshToken;
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
  ok(res, null, "Logged out successfully");
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.auth!.userId, req.body.currentPassword, req.body.newPassword);
  ok(res, null, "Password changed successfully. Please log in again.");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.identifier);
  ok(res, result, "If the account exists, a reset code has been sent");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  ok(res, null, "Password reset successfully");
});

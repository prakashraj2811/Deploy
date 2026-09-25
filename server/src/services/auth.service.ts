import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateOpaqueToken, generateOtp, hashOpaqueValue, signAccessToken } from "../utils/tokens";
import { loadEffectiveAuthz } from "./authz.service";
import { emailProvider } from "../integrations/email";
import { smsProvider } from "../integrations/sms";
import type { OtpPurpose } from "@prisma/client";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_EXPIRY_DAYS = 30;
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

async function issueOtp(identifier: string, purpose: OtpPurpose, userId?: string) {
  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      userId,
      identifier,
      codeHash: hashOpaqueValue(code),
      purpose,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000),
    },
  });

  const isEmail = identifier.includes("@");
  const message = `Your verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;
  if (isEmail) {
    await emailProvider.send({ to: identifier, subject: "Your verification code", html: `<p>${message}</p>`, text: message });
  } else {
    await smsProvider.send(identifier, message);
  }
}

export async function register(input: { email: string; mobile: string; password: string }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { mobile: input.mobile }] },
  });
  if (existing) {
    throw ApiError.conflict("An account with this email or mobile already exists", "USER_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const userRole = await prisma.role.findUnique({ where: { name: "user" } });
  if (!userRole) {
    throw ApiError.internal("Default 'user' role is not seeded", "ROLE_NOT_SEEDED");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      mobile: input.mobile,
      passwordHash,
      roles: { create: { roleId: userRole.id } },
      notificationPrefs: { create: {} },
    },
  });

  await issueOtp(input.mobile, "REGISTRATION_MOBILE", user.id);
  await issueOtp(input.email, "REGISTRATION_EMAIL", user.id);

  return { userId: user.id };
}

export async function verifyOtp(input: { identifier: string; code: string; purpose: OtpPurpose }) {
  const otp = await prisma.otpCode.findFirst({
    where: { identifier: input.identifier, purpose: input.purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) throw ApiError.badRequest("No pending verification found for this identifier", "OTP_NOT_FOUND");
  if (otp.expiresAt < new Date()) throw ApiError.badRequest("Verification code has expired", "OTP_EXPIRED");
  if (otp.attempts >= MAX_OTP_ATTEMPTS) throw ApiError.badRequest("Too many attempts, request a new code", "OTP_LOCKED");

  if (otp.codeHash !== hashOpaqueValue(input.code)) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw ApiError.badRequest("Incorrect verification code", "OTP_INCORRECT");
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  if (otp.userId && input.purpose === "REGISTRATION_MOBILE") {
    await prisma.user.update({ where: { id: otp.userId }, data: { mobileVerifiedAt: new Date() } });
  }
  if (otp.userId && input.purpose === "REGISTRATION_EMAIL") {
    await prisma.user.update({ where: { id: otp.userId }, data: { emailVerifiedAt: new Date() } });
  }

  return { verified: true };
}

export async function resendOtp(input: { identifier: string; purpose: OtpPurpose }) {
  const user = await prisma.user.findFirst({ where: { OR: [{ email: input.identifier }, { mobile: input.identifier }] } });
  await issueOtp(input.identifier, input.purpose, user?.id);
  return { sent: true };
}

async function issueSessionTokens(userId: string, meta: { userAgent?: string; ipAddress?: string }) {
  const authz = await loadEffectiveAuthz(userId);
  const accessToken = signAccessToken({ userId, roles: authz.roles, permissions: authz.permissions });

  const refreshToken = generateOpaqueToken();
  await prisma.loginSession.create({
    data: {
      userId,
      refreshToken: hashOpaqueValue(refreshToken),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60_000),
    },
  });

  return { accessToken, refreshToken, roles: authz.roles, permissions: authz.permissions };
}

export async function login(input: { identifier: string; password: string; userAgent?: string; ipAddress?: string }) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: input.identifier }, { mobile: input.identifier }] },
  });

  if (!user) throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw ApiError.forbidden("Account temporarily locked due to failed login attempts", "ACCOUNT_LOCKED");
  }
  if (user.status !== "ACTIVE") {
    throw ApiError.forbidden(`Account is ${user.status.toLowerCase()}`, "ACCOUNT_NOT_ACTIVE");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    const failedCount = user.failedLoginCount + 1;
    const shouldLock = failedCount >= MAX_FAILED_LOGINS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: shouldLock ? 0 : failedCount,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : undefined,
      },
    });
    throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const tokens = await issueSessionTokens(user.id, { userAgent: input.userAgent, ipAddress: input.ipAddress });
  return { ...tokens, userId: user.id };
}

export async function refresh(rawRefreshToken: string, meta: { userAgent?: string; ipAddress?: string }) {
  const hashed = hashOpaqueValue(rawRefreshToken);
  const session = await prisma.loginSession.findUnique({ where: { refreshToken: hashed } });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw ApiError.unauthorized("Invalid or expired refresh token", "REFRESH_INVALID");
  }

  await prisma.loginSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

  return issueSessionTokens(session.userId, meta);
}

export async function logout(rawRefreshToken: string) {
  const hashed = hashOpaqueValue(rawRefreshToken);
  await prisma.loginSession.updateMany({
    where: { refreshToken: hashed, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAllSessions(userId: string) {
  await prisma.loginSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.badRequest("Current password is incorrect", "INVALID_PASSWORD");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await logoutAllSessions(userId);
}

export async function forgotPassword(identifier: string) {
  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { mobile: identifier }] } });
  if (user) {
    await issueOtp(identifier, "PASSWORD_RESET", user.id);
  }
  // Always return success to avoid leaking which identifiers are registered.
  return { sent: true };
}

export async function resetPassword(input: { identifier: string; code: string; newPassword: string }) {
  await verifyOtp({ identifier: input.identifier, code: input.code, purpose: "PASSWORD_RESET" });

  const user = await prisma.user.findFirstOrThrow({
    where: { OR: [{ email: input.identifier }, { mobile: input.identifier }] },
  });

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await logoutAllSessions(user.id);
}

export { REFRESH_EXPIRY_DAYS };

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  roles: string[];
  permissions: string[];
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function generateOpaqueToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
}

export function hashOpaqueValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

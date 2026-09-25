import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface RegisterInput {
  email: string;
  mobile: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

export async function register(input: RegisterInput) {
  const res = await apiClient.post<ApiSuccess<{ userId: string }>>("/auth/register", input);
  return res.data.data;
}

export async function verifyOtp(input: { identifier: string; code: string; purpose: string }) {
  const res = await apiClient.post<ApiSuccess<{ verified: boolean }>>("/auth/verify-otp", input);
  return res.data.data;
}

export async function resendOtp(input: { identifier: string; purpose: string }) {
  const res = await apiClient.post<ApiSuccess<{ sent: boolean }>>("/auth/resend-otp", input);
  return res.data.data;
}

export async function login(input: LoginInput) {
  const res = await apiClient.post<ApiSuccess<LoginResult>>("/auth/login", input);
  return res.data.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function forgotPassword(identifier: string) {
  const res = await apiClient.post<ApiSuccess<{ sent: boolean }>>("/auth/forgot-password", { identifier });
  return res.data.data;
}

export async function resetPassword(input: { identifier: string; code: string; newPassword: string }) {
  await apiClient.post("/auth/reset-password", input);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiClient.post("/auth/change-password", { currentPassword, newPassword });
}

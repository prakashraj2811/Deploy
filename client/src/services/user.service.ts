import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface MeResponse {
  id: string;
  email: string;
  mobile: string;
  status: string;
  emailVerifiedAt: string | null;
  mobileVerifiedAt: string | null;
  roles: { role: { name: string; label: string } }[];
  profile: { id: string; fullName: string; status: string; completionPercent: number } | null;
}

export async function getMe() {
  const res = await apiClient.get<ApiSuccess<MeResponse>>("/users/me");
  return res.data.data;
}

export async function getNotifications(unreadOnly = false) {
  const res = await apiClient.get<ApiSuccess<unknown[]>>("/users/me/notifications", { params: { unreadOnly } });
  return res.data.data;
}

export async function markAllNotificationsRead() {
  await apiClient.put("/users/me/notifications/read-all");
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  interestAlerts: boolean;
  messageAlerts: boolean;
  marketingEmails: boolean;
}

export async function getNotificationPreferences() {
  const res = await apiClient.get<ApiSuccess<NotificationPreferences>>("/users/me/notification-preferences");
  return res.data.data;
}

export async function updateNotificationPreferences(data: Partial<NotificationPreferences>) {
  const res = await apiClient.put<ApiSuccess<NotificationPreferences>>("/users/me/notification-preferences", data);
  return res.data.data;
}

export interface SessionRow {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

export async function listSessions() {
  const res = await apiClient.get<ApiSuccess<SessionRow[]>>("/users/me/sessions");
  return res.data.data;
}

export async function revokeSession(id: string) {
  await apiClient.delete(`/users/me/sessions/${id}`);
}

export async function deactivateAccount() {
  await apiClient.post("/users/me/deactivate");
}

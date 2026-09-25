import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  verifiedProfiles: number;
  pendingVerification: number;
  suspendedUsers: number;
  premiumUsers: number;
  activeSubscriptions: number;
  interestsSent: number;
  interestsAccepted: number;
  interestAcceptanceRate: number;
  openReports: number;
  openTickets: number;
}

export async function getDashboardMetrics() {
  const res = await apiClient.get<ApiSuccess<DashboardMetrics>>("/admin/dashboard");
  return res.data.data;
}

export interface AdminUserRow {
  id: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  profile: { fullName: string; status: string; completionPercent: number } | null;
  roles: { role: { name: string } }[];
}

export async function listUsers(params: { page?: number; limit?: number; status?: string; search?: string }) {
  const res = await apiClient.get<ApiSuccess<AdminUserRow[]>>("/admin/users", { params });
  return res.data;
}

export async function setUserStatus(id: string, status: string) {
  await apiClient.put(`/admin/users/${id}/status`, { status });
}

export async function listVerificationRequests(status?: string) {
  const res = await apiClient.get<ApiSuccess<unknown[]>>("/admin/verifications", { params: { status } });
  return res.data.data;
}

export async function decideVerification(id: string, approve: boolean, note?: string) {
  await apiClient.put(`/admin/verifications/${id}/decide`, { approve, note });
}

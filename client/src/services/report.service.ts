import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface ReportRow {
  id: string;
  filedById: string;
  againstId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export async function listReports(status?: string) {
  const res = await apiClient.get<ApiSuccess<ReportRow[]>>("/reports", { params: { status } });
  return res.data.data;
}

export async function updateReport(id: string, data: { status?: string; resolution?: string }) {
  await apiClient.put(`/reports/${id}`, data);
}

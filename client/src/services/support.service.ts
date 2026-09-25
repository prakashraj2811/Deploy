import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface TicketRow {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { email: string; mobile: string };
}

export async function listTickets(status?: string) {
  const res = await apiClient.get<ApiSuccess<TicketRow[]>>("/support/tickets", { params: { status } });
  return res.data.data;
}

export async function updateTicket(id: string, data: { status?: string; priority?: string }) {
  await apiClient.put(`/support/tickets/${id}`, data);
}

export async function createTicket(input: { subject: string; message: string; priority?: string }) {
  const res = await apiClient.post<ApiSuccess<unknown>>("/support/tickets", input);
  return res.data.data;
}

export async function listMyTickets() {
  const res = await apiClient.get<ApiSuccess<TicketRow[]>>("/support/tickets/mine");
  return res.data.data;
}

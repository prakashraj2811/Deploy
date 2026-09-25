import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export async function sendInterest(receiverId: string) {
  const res = await apiClient.post<ApiSuccess<unknown>>("/interests", { receiverId });
  return res.data.data;
}

export async function acceptInterest(id: string) {
  await apiClient.post(`/interests/${id}/accept`);
}

export async function declineInterest(id: string) {
  await apiClient.post(`/interests/${id}/decline`);
}

export async function withdrawInterest(id: string) {
  await apiClient.post(`/interests/${id}/withdraw`);
}

export async function listSentInterests() {
  const res = await apiClient.get<ApiSuccess<unknown[]>>("/interests/sent");
  return res.data.data;
}

export async function listReceivedInterests() {
  const res = await apiClient.get<ApiSuccess<unknown[]>>("/interests/received");
  return res.data.data;
}

export async function addToShortlist(targetId: string, category = "Favorites") {
  const res = await apiClient.post<ApiSuccess<unknown>>("/shortlists", { targetId, category });
  return res.data.data;
}

export async function removeFromShortlist(targetId: string) {
  await apiClient.delete(`/shortlists/${targetId}`);
}

export async function listShortlist() {
  const res = await apiClient.get<ApiSuccess<unknown[]>>("/shortlists");
  return res.data.data;
}

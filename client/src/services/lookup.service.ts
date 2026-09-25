import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface LookupItem {
  id: string;
  name: string;
}

export async function getReligions() {
  const res = await apiClient.get<ApiSuccess<LookupItem[]>>("/lookups/religions");
  return res.data.data;
}

export async function getCommunities(religionId: string) {
  const res = await apiClient.get<ApiSuccess<LookupItem[]>>("/lookups/communities", { params: { religionId } });
  return res.data.data;
}

export async function getCastes(communityId: string) {
  const res = await apiClient.get<ApiSuccess<LookupItem[]>>("/lookups/castes", { params: { communityId } });
  return res.data.data;
}

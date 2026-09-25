import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";
import type { SearchResultCard, MatchCard } from "@/types/profile";

export interface SearchFilters {
  minAge?: number;
  maxAge?: number;
  gender?: string;
  religionId?: string;
  communityId?: string;
  country?: string;
  state?: string;
  city?: string;
  minHeightCm?: number;
  maxHeightCm?: number;
  education?: string;
  occupation?: string;
  minIncome?: number;
  maritalStatus?: string;
  foodPreference?: string;
  verifiedOnly?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function searchProfiles(filters: SearchFilters) {
  const res = await apiClient.get<ApiSuccess<SearchResultCard[]>>("/search", { params: filters });
  return res.data;
}

export async function getMatches(category: string) {
  const res = await apiClient.get<ApiSuccess<MatchCard[]>>(`/matches/${category}`);
  return res.data.data;
}

import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";
import type { Profile } from "@/types/profile";

export async function getMyProfile() {
  const res = await apiClient.get<ApiSuccess<Profile | null>>("/profiles/me");
  return res.data.data;
}

export async function getProfileById(id: string) {
  const res = await apiClient.get<ApiSuccess<Profile>>(`/profiles/${id}`);
  return res.data.data;
}

export async function updateBasicInfo(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/basic-info", data);
  return res.data.data;
}

export async function updateEducation(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/education", data);
  return res.data.data;
}

export async function updateCareer(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/career", data);
  return res.data.data;
}

export async function updateFamily(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/family", data);
  return res.data.data;
}

export async function updateLifestyle(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/lifestyle", data);
  return res.data.data;
}

export async function updatePartnerPreference(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/partner-preference", data);
  return res.data.data;
}

export async function updatePrivacySettings(data: Record<string, unknown>) {
  const res = await apiClient.put<ApiSuccess<Profile>>("/profiles/me/privacy", data);
  return res.data.data;
}

export async function submitForVerification() {
  const res = await apiClient.post<ApiSuccess<Profile>>("/profiles/me/submit-verification");
  return res.data.data;
}

export async function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  const res = await apiClient.post<ApiSuccess<unknown>>("/profiles/me/photos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function deletePhoto(photoId: string) {
  await apiClient.delete(`/profiles/me/photos/${photoId}`);
}

export async function setPrimaryPhoto(photoId: string) {
  const res = await apiClient.put<ApiSuccess<Profile>>(`/profiles/me/photos/${photoId}/primary`);
  return res.data.data;
}

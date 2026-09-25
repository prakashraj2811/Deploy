import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import type { ApiFailure } from "@/types/api";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const accessToken = res.data?.data?.accessToken as string | undefined;
    if (!accessToken) return null;

    const currentUser = useAuthStore.getState().user;
    useAuthStore.getState().setSession(accessToken, {
      userId: currentUser?.userId ?? "",
      roles: res.data.data.roles ?? currentUser?.roles ?? [],
      permissions: res.data.data.permissions ?? currentUser?.permissions ?? [],
    });
    return accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailure>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes("/auth/")) {
      originalRequest._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiFailure | undefined)?.message ?? fallback;
  }
  return fallback;
}

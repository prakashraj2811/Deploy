export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiFailure {
  success: false;
  message: string;
  errorCode: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

import { Response } from "express";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(res: Response, data: T, message = "Operation successful", pagination?: Pagination, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
}

export function created<T>(res: Response, data: T, message = "Created successfully") {
  return ok(res, data, message, undefined, 201);
}

export function fail(res: Response, message = "Something went wrong", errorCode = "ERROR", statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(details ? { details } : {}),
  });
}

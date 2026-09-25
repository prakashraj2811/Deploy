import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { fail } from "../utils/apiResponse";

export function notFoundHandler(req: Request, res: Response) {
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND", 404);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return fail(res, err.message, err.errorCode, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    return fail(res, "Validation failed", "VALIDATION_ERROR", 422, err.flatten());
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return fail(res, "Internal server error", "INTERNAL_ERROR", 500);
}

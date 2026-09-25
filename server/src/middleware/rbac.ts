import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

/** Require the authenticated user to hold ALL of the given permission keys. */
export function requirePermissions(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw ApiError.unauthorized();
    }
    const granted = new Set(req.auth.permissions);
    const missing = permissions.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      throw ApiError.forbidden(`Missing required permission(s): ${missing.join(", ")}`, "PERMISSION_DENIED");
    }
    next();
  };
}

/** Require the authenticated user to hold ANY of the given roles. */
export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw ApiError.unauthorized();
    }
    const hasRole = req.auth.roles.some((r) => roles.includes(r));
    if (!hasRole) {
      throw ApiError.forbidden(`Requires one of role(s): ${roles.join(", ")}`, "ROLE_DENIED");
    }
    next();
  };
}

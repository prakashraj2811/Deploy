import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AccessTokenPayload, verifyAccessToken } from "../utils/tokens";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token", "TOKEN_INVALID");
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.auth = verifyAccessToken(header.slice("Bearer ".length));
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

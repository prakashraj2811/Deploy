import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import * as adminService from "../services/admin.service";

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await adminService.getDashboardMetrics());
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const result = await adminService.listUsers({ page, limit, status: req.query.status as string | undefined, search: req.query.search as string | undefined });
  ok(res, result.items, "Users", result.pagination);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await adminService.getUserDetail(req.params.id));
});

export const setUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.setUserStatus(req.auth!.userId, req.params.id, req.body.status);
  ok(res, user, "User status updated");
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.softDeleteUser(req.auth!.userId, req.params.id);
  ok(res, user, "User deleted");
});

export const restoreUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.restoreUser(req.auth!.userId, req.params.id);
  ok(res, user, "User restored");
});

export const listVerificationRequests = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await adminService.listVerificationRequests(req.query.status as string | undefined));
});

export const decideVerification = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.decideVerification(req.auth!.userId, req.params.id, req.body.approve, req.body.note);
  ok(res, result, "Verification decision recorded");
});

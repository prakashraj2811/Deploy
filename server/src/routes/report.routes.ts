import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { requirePermissions } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { created, ok } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";

const router = Router();
router.use(requireAuth);

const REASONS = ["FAKE_PROFILE", "SCAM", "HARASSMENT", "INAPPROPRIATE_CONTENT", "WRONG_INFORMATION", "SPAM", "ABUSE", "OTHER"] as const;

router.post(
  "/",
  validate({ body: z.object({ againstId: z.string().uuid(), reason: z.enum(REASONS), details: z.string().max(1000).optional() }) }),
  asyncHandler(async (req, res) => {
    if (req.body.againstId === req.auth!.userId) throw ApiError.badRequest("Cannot report yourself", "SELF_REPORT");
    const report = await prisma.report.create({ data: { filedById: req.auth!.userId, ...req.body } });
    created(res, report, "Report submitted");
  })
);

router.get("/mine", asyncHandler(async (req, res) => ok(res, await prisma.report.findMany({ where: { filedById: req.auth!.userId }, orderBy: { createdAt: "desc" } }))));

router.get(
  "/",
  requirePermissions("reports.view"),
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    ok(res, await prisma.report.findMany({ where: { status: status as never }, orderBy: { createdAt: "desc" } }));
  })
);

router.put(
  "/:id",
  requirePermissions("reports.manage"),
  validate({
    body: z.object({
      status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
      assignedTo: z.string().uuid().optional(),
      resolution: z.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { ...req.body, resolvedAt: req.body.status === "RESOLVED" ? new Date() : undefined },
    });
    ok(res, report, "Report updated");
  })
);

export default router;

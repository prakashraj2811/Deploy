import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { requirePermissions } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { created, ok } from "../utils/apiResponse";

const router = Router();
router.use(requireAuth);

router.post(
  "/tickets",
  validate({ body: z.object({ subject: z.string().min(3).max(200), message: z.string().min(3).max(2000), priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM") }) }),
  asyncHandler(async (req, res) => {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.auth!.userId,
        subject: req.body.subject,
        priority: req.body.priority,
        messages: { create: { senderId: req.auth!.userId, body: req.body.message } },
      },
      include: { messages: true },
    });
    created(res, ticket, "Support ticket created");
  })
);

router.get("/tickets/mine", asyncHandler(async (req, res) => ok(res, await prisma.supportTicket.findMany({ where: { userId: req.auth!.userId }, orderBy: { createdAt: "desc" } }))));

router.get(
  "/tickets",
  requirePermissions("support.view"),
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    ok(res, await prisma.supportTicket.findMany({ where: { status: status as never }, orderBy: { createdAt: "desc" }, include: { user: { select: { email: true, mobile: true } } } }));
  })
);

router.get(
  "/tickets/:id",
  requirePermissions("support.view"),
  asyncHandler(async (req, res) => ok(res, await prisma.supportTicket.findUnique({ where: { id: req.params.id }, include: { messages: true, user: true } })))
);

router.put(
  "/tickets/:id",
  requirePermissions("support.manage"),
  validate({
    body: z.object({
      status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
      assignedTo: z.string().uuid().optional(),
    }),
  }),
  asyncHandler(async (req, res) => ok(res, await prisma.supportTicket.update({ where: { id: req.params.id }, data: req.body }), "Ticket updated"))
);

router.post(
  "/tickets/:id/messages",
  validate({ body: z.object({ body: z.string().min(1).max(2000), isInternal: z.boolean().optional() }) }),
  asyncHandler(async (req, res) => {
    const message = await prisma.supportTicketMessage.create({
      data: { ticketId: req.params.id, senderId: req.auth!.userId, body: req.body.body, isInternal: Boolean(req.body.isInternal) },
    });
    created(res, message, "Message added");
  })
);

export default router;

import { Router } from "express";
import { z } from "zod";
import * as subscriptionService from "../services/subscription.service";
import { requireAuth } from "../middleware/auth";
import { requirePermissions } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { created, ok } from "../utils/apiResponse";

const router = Router();

router.get("/plans", asyncHandler(async (_req, res) => ok(res, await subscriptionService.listPlans())));

const planSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  tagline: z.string().optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().default("INR"),
  durationDays: z.number().int().min(1),
  features: z.array(z.string()).optional(),
  maxInterests: z.number().int().optional(),
  maxSearches: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
});

router.post(
  "/plans",
  requireAuth,
  requirePermissions("subscriptions.create"),
  validate({ body: planSchema }),
  asyncHandler(async (req, res) => created(res, await subscriptionService.createPlan(req.body), "Plan created"))
);

router.put(
  "/plans/:id",
  requireAuth,
  requirePermissions("subscriptions.edit"),
  validate({ body: planSchema.partial() }),
  asyncHandler(async (req, res) => ok(res, await subscriptionService.updatePlan(req.params.id, req.body), "Plan updated"))
);

router.delete(
  "/plans/:id",
  requireAuth,
  requirePermissions("subscriptions.edit"),
  asyncHandler(async (req, res) => ok(res, await subscriptionService.deletePlan(req.params.id), "Plan deactivated"))
);

router.use(requireAuth);

router.get("/me", asyncHandler(async (req, res) => ok(res, await subscriptionService.mySubscription(req.auth!.userId))));

router.post(
  "/checkout",
  validate({ body: z.object({ planId: z.string().uuid() }) }),
  asyncHandler(async (req, res) => created(res, await subscriptionService.initiateCheckout(req.auth!.userId, req.body.planId), "Checkout initiated"))
);

router.post(
  "/checkout/verify",
  validate({ body: z.object({ paymentId: z.string().uuid(), providerPaymentId: z.string(), signature: z.string() }) }),
  asyncHandler(async (req, res) => ok(res, await subscriptionService.verifyCheckout(req.auth!.userId, req.body), "Subscription activated"))
);

router.get("/payments", asyncHandler(async (req, res) => ok(res, await subscriptionService.myPaymentHistory(req.auth!.userId))));

export default router;

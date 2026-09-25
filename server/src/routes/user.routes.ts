import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import * as userService from "../services/user.service";

const router = Router();
router.use(requireAuth);

router.get("/me", asyncHandler(async (req, res) => ok(res, await userService.getMe(req.auth!.userId))));

router.get(
  "/me/notifications",
  asyncHandler(async (req, res) => {
    const unreadOnly = req.query.unreadOnly === "true";
    ok(res, await userService.getNotifications(req.auth!.userId, unreadOnly));
  })
);
router.put("/me/notifications/:id/read", asyncHandler(async (req, res) => ok(res, await userService.markNotificationRead(req.auth!.userId, req.params.id))));
router.put("/me/notifications/read-all", asyncHandler(async (req, res) => ok(res, await userService.markAllNotificationsRead(req.auth!.userId))));

router.get("/me/notification-preferences", asyncHandler(async (req, res) => ok(res, await userService.getNotificationPreferences(req.auth!.userId))));
router.put(
  "/me/notification-preferences",
  validate({
    body: z.object({
      emailEnabled: z.boolean().optional(),
      smsEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      interestAlerts: z.boolean().optional(),
      messageAlerts: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
    }),
  }),
  asyncHandler(async (req, res) => ok(res, await userService.updateNotificationPreferences(req.auth!.userId, req.body)))
);

router.get("/me/sessions", asyncHandler(async (req, res) => ok(res, await userService.listSessions(req.auth!.userId))));
router.delete("/me/sessions/:id", asyncHandler(async (req, res) => ok(res, await userService.revokeSession(req.auth!.userId, req.params.id))));

router.post("/me/deactivate", asyncHandler(async (req, res) => ok(res, await userService.deactivateAccount(req.auth!.userId))));

export default router;

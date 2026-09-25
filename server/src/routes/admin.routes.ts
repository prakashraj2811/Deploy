import { Router } from "express";
import { z } from "zod";
import * as adminController from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth";
import { requirePermissions } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", requirePermissions("admin.dashboard.view"), adminController.dashboard);

router.get("/users", requirePermissions("users.view"), adminController.listUsers);
router.get("/users/:id", requirePermissions("users.view"), adminController.getUser);
router.put(
  "/users/:id/status",
  requirePermissions("users.edit"),
  validate({ body: z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "BLOCKED", "DEACTIVATED"]) }) }),
  adminController.setUserStatus
);
router.delete("/users/:id", requirePermissions("users.delete"), adminController.deleteUser);
router.post("/users/:id/restore", requirePermissions("users.delete"), adminController.restoreUser);

router.get("/verifications", requirePermissions("profiles.approve"), adminController.listVerificationRequests);
router.put(
  "/verifications/:id/decide",
  requirePermissions("profiles.approve"),
  validate({ body: z.object({ approve: z.boolean(), note: z.string().optional() }) }),
  adminController.decideVerification
);

export default router;

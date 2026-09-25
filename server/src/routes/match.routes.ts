import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import * as matchingService from "../services/matching.service";

const router = Router();
router.use(requireAuth);

router.get(
  "/:category",
  asyncHandler(async (req, res) => {
    const allowed = ["recommended", "new", "nearby", "active", "premium"];
    const category = allowed.includes(req.params.category) ? req.params.category : "recommended";
    const matches = await matchingService.getMatches(req.auth!.userId, category);
    ok(res, matches);
  })
);

export default router;

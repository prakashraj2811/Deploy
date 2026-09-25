import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { created, ok } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.shortlist.findMany({
      where: { ownerId: req.auth!.userId },
      orderBy: { createdAt: "desc" },
      include: { target: { include: { profile: { select: { fullName: true, photos: { where: { isPrimary: true }, take: 1 } } } } } },
    });
    ok(res, items);
  })
);

router.post(
  "/",
  validate({ body: z.object({ targetId: z.string().uuid(), category: z.string().min(1).max(50).default("Favorites") }) }),
  asyncHandler(async (req, res) => {
    const { targetId, category } = req.body;
    if (targetId === req.auth!.userId) throw ApiError.badRequest("Cannot shortlist yourself", "SELF_SHORTLIST");

    const item = await prisma.shortlist.upsert({
      where: { ownerId_targetId: { ownerId: req.auth!.userId, targetId } },
      update: { category },
      create: { ownerId: req.auth!.userId, targetId, category },
    });
    created(res, item, "Added to shortlist");
  })
);

router.delete(
  "/:targetId",
  asyncHandler(async (req, res) => {
    await prisma.shortlist.deleteMany({ where: { ownerId: req.auth!.userId, targetId: req.params.targetId } });
    ok(res, { removed: true }, "Removed from shortlist");
  })
);

export default router;

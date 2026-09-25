import { Router } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

const router = Router();

router.get(
  "/religions",
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.religion.findMany({ orderBy: { name: "asc" } }));
  })
);

router.get(
  "/communities",
  asyncHandler(async (req, res) => {
    const religionId = req.query.religionId as string | undefined;
    ok(res, await prisma.community.findMany({ where: { religionId }, orderBy: { name: "asc" } }));
  })
);

router.get(
  "/castes",
  asyncHandler(async (req, res) => {
    const communityId = req.query.communityId as string | undefined;
    ok(res, await prisma.caste.findMany({ where: { communityId }, orderBy: { name: "asc" } }));
  })
);

router.get(
  "/locations",
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;
    ok(
      res,
      await prisma.location.findMany({
        where: search ? { city: { contains: search, mode: "insensitive" } } : undefined,
        take: 20,
        orderBy: { city: "asc" },
      })
    );
  })
);

export default router;

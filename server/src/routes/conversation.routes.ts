import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { lastMessageAt: "desc" },
    });
    ok(res, conversations);
  })
);

router.get(
  "/:id/messages",
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;
    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation || (conversation.userAId !== userId && conversation.userBId !== userId)) {
      throw ApiError.forbidden("Not a participant in this conversation");
    }
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    ok(res, messages);
  })
);

router.delete(
  "/messages/:messageId",
  asyncHandler(async (req, res) => {
    const message = await prisma.message.findUnique({ where: { id: req.params.messageId } });
    if (!message || message.senderId !== req.auth!.userId) throw ApiError.forbidden("Cannot delete this message");
    await prisma.message.update({ where: { id: message.id }, data: { deletedAt: new Date() } });
    ok(res, { deleted: true });
  })
);

export default router;

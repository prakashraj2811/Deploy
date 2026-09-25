import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function sendInterest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw ApiError.badRequest("Cannot send interest to yourself", "SELF_INTEREST");

  const existing = await prisma.interest.findUnique({ where: { senderId_receiverId: { senderId, receiverId } } });
  if (existing && existing.status !== "WITHDRAWN") {
    throw ApiError.conflict("Interest already sent to this profile", "INTEREST_EXISTS");
  }

  const interest = existing
    ? await prisma.interest.update({ where: { id: existing.id }, data: { status: "SENT" } })
    : await prisma.interest.create({ data: { senderId, receiverId, status: "SENT" } });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "INTEREST_RECEIVED",
      title: "New interest received",
      body: "Someone has shown interest in your profile.",
    },
  });

  return interest;
}

async function requireInterest(id: string) {
  const interest = await prisma.interest.findUnique({ where: { id } });
  if (!interest) throw ApiError.notFound("Interest not found", "INTEREST_NOT_FOUND");
  return interest;
}

export async function acceptInterest(userId: string, interestId: string) {
  const interest = await requireInterest(interestId);
  if (interest.receiverId !== userId) throw ApiError.forbidden("Not authorized to act on this interest");

  const updated = await prisma.interest.update({ where: { id: interestId }, data: { status: "ACCEPTED" } });
  await prisma.notification.create({
    data: { userId: interest.senderId, type: "INTEREST_ACCEPTED", title: "Interest accepted", body: "Your interest was accepted." },
  });
  return updated;
}

export async function declineInterest(userId: string, interestId: string) {
  const interest = await requireInterest(interestId);
  if (interest.receiverId !== userId) throw ApiError.forbidden("Not authorized to act on this interest");
  return prisma.interest.update({ where: { id: interestId }, data: { status: "DECLINED" } });
}

export async function withdrawInterest(userId: string, interestId: string) {
  const interest = await requireInterest(interestId);
  if (interest.senderId !== userId) throw ApiError.forbidden("Not authorized to act on this interest");
  return prisma.interest.update({ where: { id: interestId }, data: { status: "WITHDRAWN" } });
}

export async function listSentInterests(userId: string) {
  return prisma.interest.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    include: { receiver: { include: { profile: { select: { fullName: true, photos: { where: { isPrimary: true }, take: 1 } } } } } },
  });
}

export async function listReceivedInterests(userId: string) {
  return prisma.interest.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: "desc" },
    include: { sender: { include: { profile: { select: { fullName: true, photos: { where: { isPrimary: true }, take: 1 } } } } } },
  });
}

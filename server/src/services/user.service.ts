import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      mobile: true,
      status: true,
      emailVerifiedAt: true,
      mobileVerifiedAt: true,
      createdAt: true,
      roles: { select: { role: { select: { name: true, label: true } } } },
      profile: { select: { id: true, fullName: true, status: true, completionPercent: true } },
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function getNotifications(userId: string, unreadOnly: boolean) {
  return prisma.notification.findMany({
    where: { userId, readAt: unreadOnly ? null : undefined },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw ApiError.notFound("Notification not found");
  return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  return { updated: true };
}

export async function getNotificationPreferences(userId: string) {
  return prisma.notificationPreference.findUnique({ where: { userId } });
}

export async function updateNotificationPreferences(userId: string, data: Record<string, boolean>) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function listSessions(userId: string) {
  return prisma.loginSession.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
  });
}

export async function revokeSession(userId: string, sessionId: string) {
  const session = await prisma.loginSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw ApiError.notFound("Session not found");
  await prisma.loginSession.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
  return { revoked: true };
}

export async function deactivateAccount(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { status: "DEACTIVATED" } });
  await prisma.loginSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return { deactivated: true };
}

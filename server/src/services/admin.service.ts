import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function getDashboardMetrics() {
  const [totalUsers, activeUsers, verifiedProfiles, pendingVerification, suspendedUsers, premiumUserRows, activeSubscriptions, interestsSent, interestsAccepted, openReports, openTickets] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.profile.count({ where: { status: "VERIFIED" } }),
      prisma.profile.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.userSubscription.findMany({ where: { status: "ACTIVE" }, select: { userId: true }, distinct: ["userId"] }),
      prisma.userSubscription.count({ where: { status: "ACTIVE" } }),
      prisma.interest.count(),
      prisma.interest.count({ where: { status: "ACCEPTED" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } }),
    ]);
  const premiumUsers = premiumUserRows.length;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newRegistrations = await prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

  return {
    totalUsers,
    activeUsers,
    newRegistrations,
    verifiedProfiles,
    pendingVerification,
    suspendedUsers,
    premiumUsers,
    activeSubscriptions,
    interestsSent,
    interestsAccepted,
    interestAcceptanceRate: interestsSent > 0 ? Math.round((interestsAccepted / interestsSent) * 100) : 0,
    openReports,
    openTickets,
  };
}

interface ListUsersQuery {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export async function listUsers(query: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    status: query.status as never,
    OR: query.search
      ? [
          { email: { contains: query.search, mode: "insensitive" } },
          { mobile: { contains: query.search, mode: "insensitive" } },
          { profile: { fullName: { contains: query.search, mode: "insensitive" } } },
        ]
      : undefined,
  };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        mobile: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        profile: { select: { fullName: true, status: true, completionPercent: true } },
        roles: { select: { role: { select: { name: true } } } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: { include: { photos: true, preference: true, verifications: true } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
      roles: { include: { role: true } },
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

async function writeAudit(adminId: string, action: string, entity: string, entityId: string, oldValue?: unknown, newValue?: unknown) {
  await prisma.auditLog.create({ data: { userId: adminId, action, entity, entityId, oldValue: oldValue as Prisma.InputJsonValue, newValue: newValue as Prisma.InputJsonValue } });
}

export async function setUserStatus(adminId: string, userId: string, status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DEACTIVATED") {
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const user = await prisma.user.update({ where: { id: userId }, data: { status } });
  await writeAudit(adminId, `user.status.${status.toLowerCase()}`, "User", userId, { status: before.status }, { status });
  return user;
}

export async function softDeleteUser(adminId: string, userId: string) {
  const user = await prisma.user.update({ where: { id: userId }, data: { status: "DELETED", deletedAt: new Date() } });
  await writeAudit(adminId, "user.delete", "User", userId, undefined, { deletedAt: user.deletedAt });
  return user;
}

export async function restoreUser(adminId: string, userId: string) {
  const user = await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE", deletedAt: null } });
  await writeAudit(adminId, "user.restore", "User", userId, undefined, { status: "ACTIVE" });
  return user;
}

export async function listVerificationRequests(status?: string) {
  return prisma.verificationRequest.findMany({
    where: { status: status as never },
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { id: true, fullName: true, userId: true } } },
  });
}

export async function decideVerification(adminId: string, requestId: string, approve: boolean, note?: string) {
  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw ApiError.notFound("Verification request not found");

  const status = approve ? "APPROVED" : "REJECTED";
  await prisma.verificationRequest.update({ where: { id: requestId }, data: { status, reviewedBy: adminId, reviewNote: note, reviewedAt: new Date() } });

  if (request.type === "PROFILE") {
    await prisma.profile.update({ where: { id: request.profileId }, data: { status: approve ? "VERIFIED" : "REJECTED" } });
  }

  await writeAudit(adminId, `verification.${status.toLowerCase()}`, "VerificationRequest", requestId, undefined, { status });
  return { decided: true, status };
}

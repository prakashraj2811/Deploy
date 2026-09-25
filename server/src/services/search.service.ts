import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { SearchQuery } from "../validators/search.validators";

function ageToDateOfBirthRange(minAge?: number, maxAge?: number) {
  const now = new Date();
  const range: { gte?: Date; lte?: Date } = {};
  if (maxAge !== undefined) {
    range.gte = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
  }
  if (minAge !== undefined) {
    range.lte = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
  }
  return Object.keys(range).length ? range : undefined;
}

function buildWhere(query: SearchQuery, excludeUserId?: string): Prisma.ProfileWhereInput {
  const dobRange = ageToDateOfBirthRange(query.minAge, query.maxAge);

  return {
    status: query.verifiedOnly ? "VERIFIED" : { in: ["VERIFIED", "PENDING_VERIFICATION"] },
    userId: excludeUserId ? { not: excludeUserId } : undefined,
    gender: query.gender,
    maritalStatus: query.maritalStatus,
    religionId: query.religionId,
    communityId: query.communityId,
    casteId: query.casteId,
    motherTongue: query.motherTongue ? { equals: query.motherTongue, mode: "insensitive" } : undefined,
    foodPreference: query.foodPreference,
    smoking: query.smoking,
    drinking: query.drinking,
    dateOfBirth: dobRange,
    heightCm:
      query.minHeightCm || query.maxHeightCm
        ? { gte: query.minHeightCm, lte: query.maxHeightCm }
        : undefined,
    highestQualification: query.education ? { contains: query.education, mode: "insensitive" } : undefined,
    occupation: query.occupation ? { contains: query.occupation, mode: "insensitive" } : undefined,
    annualIncome: query.minIncome ? { gte: query.minIncome } : undefined,
    location: query.country || query.state || query.city
      ? {
          is: {
            country: query.country ? { equals: query.country, mode: "insensitive" } : undefined,
            state: query.state ? { equals: query.state, mode: "insensitive" } : undefined,
            city: query.city ? { equals: query.city, mode: "insensitive" } : undefined,
          },
        }
      : undefined,
  };
}

function buildOrderBy(sortBy: SearchQuery["sortBy"]): Prisma.ProfileOrderByWithRelationInput {
  switch (sortBy) {
    case "recent":
      return { createdAt: "desc" };
    case "completeness":
      return { completionPercent: "desc" };
    case "active":
      return { updatedAt: "desc" };
    default:
      return { completionPercent: "desc" };
  }
}

const SEARCH_CARD_SELECT = {
  id: true,
  fullName: true,
  gender: true,
  dateOfBirth: true,
  heightCm: true,
  maritalStatus: true,
  occupation: true,
  highestQualification: true,
  status: true,
  completionPercent: true,
  updatedAt: true,
  religion: { select: { name: true } },
  community: { select: { name: true } },
  location: { select: { city: true, state: true, country: true } },
  photos: { where: { isPrimary: true }, select: { url: true, visibility: true }, take: 1 },
} satisfies Prisma.ProfileSelect;

export async function searchProfiles(query: SearchQuery, excludeUserId?: string) {
  const where = buildWhere(query, excludeUserId);
  const orderBy = buildOrderBy(query.sortBy);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    prisma.profile.findMany({ where, orderBy, skip, take: query.limit, select: SEARCH_CARD_SELECT }),
    prisma.profile.count({ where }),
  ]);

  return {
    items,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

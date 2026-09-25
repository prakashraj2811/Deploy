import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

// Internal scoring weights — never exposed to clients, only the resulting percentage and
// human-readable factor labels are returned.
const WEIGHTS = {
  age: 20,
  location: 15,
  religion: 15,
  community: 10,
  education: 10,
  occupation: 10,
  income: 10,
  food: 5,
  maritalStatus: 5,
};

const CANDIDATE_SELECT = {
  id: true,
  userId: true,
  fullName: true,
  gender: true,
  dateOfBirth: true,
  maritalStatus: true,
  heightCm: true,
  religionId: true,
  communityId: true,
  highestQualification: true,
  occupation: true,
  annualIncome: true,
  foodPreference: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  location: { select: { city: true, state: true, country: true } },
  photos: { where: { isPrimary: true }, select: { url: true }, take: 1 },
} satisfies Prisma.ProfileSelect;

type Candidate = Prisma.ProfileGetPayload<{ select: typeof CANDIDATE_SELECT }>;

function ageOf(dob: Date): number {
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function scoreCandidate(
  me: Candidate,
  preference: { minAge: number | null; maxAge: number | null; minIncome: number | null; foodPreferences: string[]; maritalStatuses: string[] } | null,
  candidate: Candidate
): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  const candidateAge = ageOf(candidate.dateOfBirth);
  if (preference?.minAge && preference?.maxAge) {
    if (candidateAge >= preference.minAge && candidateAge <= preference.maxAge) {
      score += WEIGHTS.age;
      factors.push("Age matches your preference");
    }
  } else {
    score += WEIGHTS.age * 0.5;
  }

  if (me.location && candidate.location) {
    if (me.location.city === candidate.location.city) {
      score += WEIGHTS.location;
      factors.push("Same city");
    } else if (me.location.state === candidate.location.state) {
      score += WEIGHTS.location * 0.6;
      factors.push("Same state");
    }
  }

  if (me.religionId && me.religionId === candidate.religionId) {
    score += WEIGHTS.religion;
    factors.push("Same religion");
  }
  if (me.communityId && me.communityId === candidate.communityId) {
    score += WEIGHTS.community;
    factors.push("Same community");
  }
  if (me.highestQualification && candidate.highestQualification === me.highestQualification) {
    score += WEIGHTS.education;
    factors.push("Similar education");
  }
  if (me.occupation && candidate.occupation === me.occupation) {
    score += WEIGHTS.occupation;
    factors.push("Similar profession");
  }
  if (preference?.minIncome && candidate.annualIncome && candidate.annualIncome >= preference.minIncome) {
    score += WEIGHTS.income;
    factors.push("Meets income preference");
  }
  if (preference?.foodPreferences?.length && candidate.foodPreference && preference.foodPreferences.includes(candidate.foodPreference)) {
    score += WEIGHTS.food;
    factors.push("Compatible lifestyle");
  }
  if (preference?.maritalStatuses?.length && preference.maritalStatuses.includes(candidate.maritalStatus)) {
    score += WEIGHTS.maritalStatus;
    factors.push("Marital status matches");
  }

  return { score: Math.min(100, Math.round(score)), factors };
}

async function getSelfWithPreference(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { ...CANDIDATE_SELECT, preference: true },
  });
  if (!profile) throw ApiError.badRequest("Complete your profile to see matches", "PROFILE_NOT_STARTED");
  return profile;
}

async function candidatePool(userId: string, gender: string, extraWhere: Prisma.ProfileWhereInput = {}, take = 30) {
  const oppositeGender = gender === "MALE" ? "FEMALE" : gender === "FEMALE" ? "MALE" : undefined;
  return prisma.profile.findMany({
    where: {
      userId: { not: userId },
      status: { in: ["VERIFIED", "PENDING_VERIFICATION"] },
      gender: oppositeGender,
      ...extraWhere,
    },
    select: CANDIDATE_SELECT,
    take,
  });
}

export async function getMatches(userId: string, category: string) {
  const me = await getSelfWithPreference(userId);

  let candidates: Candidate[];
  switch (category) {
    case "new":
      candidates = await candidatePool(userId, me.gender, {}, 20);
      candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "nearby":
      candidates = await candidatePool(userId, me.gender, me.location ? { location: { is: { city: me.location.city } } } : {}, 20);
      break;
    case "active":
      candidates = await candidatePool(userId, me.gender, {}, 20);
      candidates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      break;
    default:
      candidates = await candidatePool(userId, me.gender, {}, 50);
  }

  const scored = candidates.map((candidate) => {
    const { score, factors } = scoreCandidate(me, me.preference, candidate);
    return {
      profileId: candidate.id,
      userId: candidate.userId,
      fullName: candidate.fullName,
      age: ageOf(candidate.dateOfBirth),
      city: candidate.location?.city ?? null,
      occupation: candidate.occupation,
      photoUrl: candidate.photos[0]?.url ?? null,
      status: candidate.status,
      compatibilityPercent: score,
      matchFactors: factors,
    };
  });

  scored.sort((a, b) => b.compatibilityPercent - a.compatibilityPercent);
  return category === "recommended" || category === "premium" ? scored.slice(0, 20) : scored;
}

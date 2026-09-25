import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { storageProvider } from "../integrations/storage";
import type { Prisma } from "@prisma/client";

const PROFILE_INCLUDE = {
  photos: { orderBy: { sortOrder: "asc" as const } },
  preference: true,
  privacy: true,
  religion: true,
  community: true,
  caste: true,
  location: true,
} satisfies Prisma.ProfileInclude;

async function findOrCreateLocation(country: string, state: string, city: string) {
  return prisma.location.upsert({
    where: { country_state_city: { country, state, city } },
    update: {},
    create: { country, state, city },
  });
}

/** Weighted completion score across the registration sections. */
function computeCompletionPercent(profile: {
  fullName: string;
  gender: string | null;
  dateOfBirth: Date | null;
  religionId: string | null;
  locationId: string | null;
  highestQualification: string | null;
  occupation: string | null;
  familyType: string | null;
  foodPreference: string | null;
  aboutMe: string | null;
  photoCount: number;
  hasPreference: boolean;
}): number {
  const sections = [
    Boolean(profile.fullName && profile.gender && profile.dateOfBirth),
    Boolean(profile.religionId && profile.locationId),
    Boolean(profile.highestQualification),
    Boolean(profile.occupation),
    Boolean(profile.familyType),
    Boolean(profile.foodPreference || profile.aboutMe),
    profile.hasPreference,
    profile.photoCount > 0,
  ];
  const filled = sections.filter(Boolean).length;
  return Math.round((filled / sections.length) * 100);
}

async function recalculateCompletion(profileId: string) {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: profileId },
    include: { photos: true, preference: true },
  });
  const completionPercent = computeCompletionPercent({
    ...profile,
    photoCount: profile.photos.length,
    hasPreference: Boolean(profile.preference),
  });
  await prisma.profile.update({ where: { id: profileId }, data: { completionPercent } });
  return completionPercent;
}

export async function getMyProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, include: PROFILE_INCLUDE });
  return profile;
}

export async function getProfileById(profileId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: profileId }, include: PROFILE_INCLUDE });
  if (!profile) throw ApiError.notFound("Profile not found", "PROFILE_NOT_FOUND");
  return profile;
}

interface BasicInfoInput {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: Date;
  maritalStatus: "NEVER_MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE";
  heightCm?: number;
  weightKg?: number;
  motherTongue?: string;
  religionId?: string;
  communityId?: string;
  casteId?: string;
  country: string;
  state: string;
  city: string;
}

export async function upsertBasicInfo(userId: string, input: BasicInfoInput) {
  const location = await findOrCreateLocation(input.country, input.state, input.city);

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      fullName: input.fullName,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      maritalStatus: input.maritalStatus,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      motherTongue: input.motherTongue,
      religionId: input.religionId,
      communityId: input.communityId,
      casteId: input.casteId,
      locationId: location.id,
    },
    create: {
      userId,
      fullName: input.fullName,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      maritalStatus: input.maritalStatus,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      motherTongue: input.motherTongue,
      religionId: input.religionId,
      communityId: input.communityId,
      casteId: input.casteId,
      locationId: location.id,
      privacy: { create: {} },
    },
  });

  await recalculateCompletion(profile.id);
  return getMyProfile(userId);
}

async function requireProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.badRequest("Complete basic info first", "PROFILE_NOT_STARTED");
  return profile;
}

export async function updateEducation(userId: string, data: Prisma.ProfileUpdateInput) {
  const profile = await requireProfile(userId);
  await prisma.profile.update({ where: { id: profile.id }, data });
  await recalculateCompletion(profile.id);
  return getMyProfile(userId);
}

export async function updateCareer(userId: string, data: Prisma.ProfileUpdateInput) {
  const profile = await requireProfile(userId);
  await prisma.profile.update({ where: { id: profile.id }, data });
  await recalculateCompletion(profile.id);
  return getMyProfile(userId);
}

export async function updateFamily(userId: string, data: Prisma.ProfileUpdateInput) {
  const profile = await requireProfile(userId);
  await prisma.profile.update({ where: { id: profile.id }, data });
  await recalculateCompletion(profile.id);
  return getMyProfile(userId);
}

export async function updateLifestyle(userId: string, data: Prisma.ProfileUpdateInput) {
  const profile = await requireProfile(userId);
  await prisma.profile.update({ where: { id: profile.id }, data });
  await recalculateCompletion(profile.id);
  return getMyProfile(userId);
}

export async function updatePartnerPreference(userId: string, data: Omit<Prisma.PartnerPreferenceCreateInput, "profile">) {
  const profile = await requireProfile(userId);
  await prisma.partnerPreference.upsert({
    where: { profileId: profile.id },
    update: data,
    create: { ...data, profile: { connect: { id: profile.id } } },
  });
  await recalculateCompletion(profile.id);
  return getMyProfile(userId);
}

export async function updatePrivacySettings(userId: string, data: Omit<Prisma.PrivacySettingsCreateInput, "profile">) {
  const profile = await requireProfile(userId);
  await prisma.privacySettings.upsert({
    where: { profileId: profile.id },
    update: data,
    create: { ...data, profile: { connect: { id: profile.id } } },
  });
  return getMyProfile(userId);
}

export async function submitForVerification(userId: string) {
  const profile = await requireProfile(userId);
  await prisma.profile.update({ where: { id: profile.id }, data: { status: "PENDING_VERIFICATION" } });
  await prisma.verificationRequest.create({ data: { profileId: profile.id, type: "PROFILE" } });
  return getMyProfile(userId);
}

export async function addPhoto(userId: string, file: { buffer: Buffer; originalname: string; mimetype: string }) {
  const profile = await requireProfile(userId);

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    throw ApiError.badRequest("Only JPEG, PNG or WEBP images are allowed", "INVALID_FILE_TYPE");
  }
  if (file.buffer.length > 5 * 1024 * 1024) {
    throw ApiError.badRequest("Image must be smaller than 5MB", "FILE_TOO_LARGE");
  }

  const upload = await storageProvider.upload({
    buffer: file.buffer,
    fileName: file.originalname,
    mimeType: file.mimetype,
    folder: `profiles/${profile.id}`,
  });

  const existingCount = await prisma.profilePhoto.count({ where: { profileId: profile.id } });
  const isPrimary = existingCount === 0;

  const photo = await prisma.profilePhoto.create({
    data: {
      profileId: profile.id,
      url: upload.url,
      isPrimary,
      sortOrder: existingCount,
    },
  });

  if (isPrimary) {
    await prisma.profile.update({ where: { id: profile.id }, data: { isPrimaryPhotoSet: true } });
  }

  await recalculateCompletion(profile.id);
  return photo;
}

export async function deletePhoto(userId: string, photoId: string) {
  const profile = await requireProfile(userId);
  const photo = await prisma.profilePhoto.findFirst({ where: { id: photoId, profileId: profile.id } });
  if (!photo) throw ApiError.notFound("Photo not found", "PHOTO_NOT_FOUND");

  await prisma.profilePhoto.delete({ where: { id: photo.id } });

  if (photo.isPrimary) {
    const next = await prisma.profilePhoto.findFirst({ where: { profileId: profile.id }, orderBy: { sortOrder: "asc" } });
    if (next) await prisma.profilePhoto.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  await recalculateCompletion(profile.id);
  return { deleted: true };
}

export async function setPrimaryPhoto(userId: string, photoId: string) {
  const profile = await requireProfile(userId);
  const photo = await prisma.profilePhoto.findFirst({ where: { id: photoId, profileId: profile.id } });
  if (!photo) throw ApiError.notFound("Photo not found", "PHOTO_NOT_FOUND");

  await prisma.$transaction([
    prisma.profilePhoto.updateMany({ where: { profileId: profile.id }, data: { isPrimary: false } }),
    prisma.profilePhoto.update({ where: { id: photo.id }, data: { isPrimary: true } }),
  ]);

  return getMyProfile(userId);
}

export async function updatePhotoVisibility(userId: string, photoId: string, visibility: string) {
  const profile = await requireProfile(userId);
  const photo = await prisma.profilePhoto.findFirst({ where: { id: photoId, profileId: profile.id } });
  if (!photo) throw ApiError.notFound("Photo not found", "PHOTO_NOT_FOUND");

  await prisma.profilePhoto.update({
    where: { id: photo.id },
    data: { visibility: visibility as Prisma.EnumPhotoVisibilityFieldUpdateOperationsInput["set"] },
  });
  return getMyProfile(userId);
}

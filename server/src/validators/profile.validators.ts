import { z } from "zod";

export const basicInfoSchema = z.object({
  fullName: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.coerce.date(),
  maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]),
  heightCm: z.number().int().min(100).max(250).optional(),
  weightKg: z.number().int().min(30).max(250).optional(),
  motherTongue: z.string().optional(),
  religionId: z.string().uuid().optional(),
  communityId: z.string().uuid().optional(),
  casteId: z.string().uuid().optional(),
  country: z.string().min(2),
  state: z.string().min(2),
  city: z.string().min(1),
});

export const educationSchema = z.object({
  highestQualification: z.string().optional(),
  college: z.string().optional(),
  fieldOfStudy: z.string().optional(),
});

export const careerSchema = z.object({
  occupation: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  annualIncome: z.number().int().min(0).optional(),
  workLocation: z.string().optional(),
});

export const familySchema = z.object({
  familyType: z.enum(["NUCLEAR", "JOINT"]).optional(),
  familyStatus: z.enum(["MIDDLE_CLASS", "UPPER_MIDDLE_CLASS", "RICH", "AFFLUENT"]).optional(),
  familyLocation: z.string().optional(),
  fatherDetails: z.string().optional(),
  motherDetails: z.string().optional(),
  siblingsDetails: z.string().optional(),
});

export const lifestyleSchema = z.object({
  foodPreference: z.enum(["VEGETARIAN", "NON_VEGETARIAN", "EGGETARIAN", "VEGAN"]).optional(),
  smoking: z.enum(["NEVER", "OCCASIONALLY", "REGULARLY"]).optional(),
  drinking: z.enum(["NEVER", "OCCASIONALLY", "REGULARLY"]).optional(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  aboutMe: z.string().max(2000).optional(),
});

export const partnerPreferenceSchema = z.object({
  minAge: z.number().int().min(18).max(100).optional(),
  maxAge: z.number().int().min(18).max(100).optional(),
  minHeightCm: z.number().int().optional(),
  maxHeightCm: z.number().int().optional(),
  religionIds: z.array(z.string().uuid()).optional(),
  communityIds: z.array(z.string().uuid()).optional(),
  educationLevels: z.array(z.string()).optional(),
  occupations: z.array(z.string()).optional(),
  minIncome: z.number().int().optional(),
  locations: z.array(z.string()).optional(),
  maritalStatuses: z.array(z.string()).optional(),
  foodPreferences: z.array(z.string()).optional(),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "NOBODY"]).optional(),
  photoVisibility: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "NOBODY"]).optional(),
  whoCanSendInterest: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "NOBODY"]).optional(),
  whoCanMessage: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "NOBODY"]).optional(),
  showPhone: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "NOBODY"]).optional(),
  showEmail: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "NOBODY"]).optional(),
});

export const photoVisibilitySchema = z.object({
  visibility: z.enum(["EVERYONE", "REGISTERED_USERS", "ACCEPTED_CONNECTIONS", "PREMIUM_MEMBERS", "PRIVATE"]),
});

export const reorderPhotosSchema = z.object({
  photoIds: z.array(z.string().uuid()),
});

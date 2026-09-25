import { z } from "zod";

export const searchQuerySchema = z.object({
  minAge: z.coerce.number().int().optional(),
  maxAge: z.coerce.number().int().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  religionId: z.string().uuid().optional(),
  communityId: z.string().uuid().optional(),
  casteId: z.string().uuid().optional(),
  motherTongue: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  minHeightCm: z.coerce.number().int().optional(),
  maxHeightCm: z.coerce.number().int().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  minIncome: z.coerce.number().int().optional(),
  maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]).optional(),
  foodPreference: z.enum(["VEGETARIAN", "NON_VEGETARIAN", "EGGETARIAN", "VEGAN"]).optional(),
  smoking: z.enum(["NEVER", "OCCASIONALLY", "REGULARLY"]).optional(),
  drinking: z.enum(["NEVER", "OCCASIONALLY", "REGULARLY"]).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  sortBy: z.enum(["relevance", "recent", "active", "completeness"]).default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

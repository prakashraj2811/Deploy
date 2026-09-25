export type Gender = "MALE" | "FEMALE" | "OTHER";
export type MaritalStatus = "NEVER_MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE";
export type ProfileStatus = "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED" | "BLOCKED";
export type FoodPreference = "VEGETARIAN" | "NON_VEGETARIAN" | "EGGETARIAN" | "VEGAN";
export type HabitLevel = "NEVER" | "OCCASIONALLY" | "REGULARLY";

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  visibility: string;
  sortOrder: number;
}

export interface Profile {
  id: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  heightCm?: number | null;
  weightKg?: number | null;
  motherTongue?: string | null;
  highestQualification?: string | null;
  occupation?: string | null;
  annualIncome?: number | null;
  aboutMe?: string | null;
  status: ProfileStatus;
  completionPercent: number;
  photos: ProfilePhoto[];
  religion?: { name: string } | null;
  community?: { name: string } | null;
  location?: { city: string; state: string; country: string } | null;
}

export interface SearchResultCard {
  id: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  heightCm?: number | null;
  maritalStatus: MaritalStatus;
  occupation?: string | null;
  highestQualification?: string | null;
  status: ProfileStatus;
  completionPercent: number;
  religion?: { name: string } | null;
  community?: { name: string } | null;
  location?: { city: string; state: string; country: string } | null;
  photos: { url: string; visibility: string }[];
}

export interface MatchCard {
  profileId: string;
  userId: string;
  fullName: string;
  age: number;
  city: string | null;
  occupation?: string | null;
  photoUrl: string | null;
  status: ProfileStatus;
  compatibilityPercent: number;
  matchFactors: string[];
}

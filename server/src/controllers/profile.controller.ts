import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as profileService from "../services/profile.service";

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.getMyProfile(req.auth!.userId);
  ok(res, profile);
});

export const getProfileById = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.getProfileById(req.params.id);
  ok(res, profile);
});

export const updateBasicInfo = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.upsertBasicInfo(req.auth!.userId, req.body);
  ok(res, profile, "Basic information saved");
});

export const updateEducation = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updateEducation(req.auth!.userId, req.body);
  ok(res, profile, "Education details saved");
});

export const updateCareer = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updateCareer(req.auth!.userId, req.body);
  ok(res, profile, "Career details saved");
});

export const updateFamily = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updateFamily(req.auth!.userId, req.body);
  ok(res, profile, "Family details saved");
});

export const updateLifestyle = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updateLifestyle(req.auth!.userId, req.body);
  ok(res, profile, "Lifestyle details saved");
});

export const updatePartnerPreference = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updatePartnerPreference(req.auth!.userId, req.body);
  ok(res, profile, "Partner preferences saved");
});

export const updatePrivacySettings = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updatePrivacySettings(req.auth!.userId, req.body);
  ok(res, profile, "Privacy settings updated");
});

export const submitForVerification = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.submitForVerification(req.auth!.userId);
  ok(res, profile, "Profile submitted for verification");
});

export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded", "FILE_MISSING");
  const photo = await profileService.addPhoto(req.auth!.userId, req.file);
  created(res, photo, "Photo uploaded");
});

export const deletePhoto = asyncHandler(async (req: Request, res: Response) => {
  const result = await profileService.deletePhoto(req.auth!.userId, req.params.photoId);
  ok(res, result, "Photo deleted");
});

export const setPrimaryPhoto = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.setPrimaryPhoto(req.auth!.userId, req.params.photoId);
  ok(res, profile, "Primary photo updated");
});

export const updatePhotoVisibility = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updatePhotoVisibility(req.auth!.userId, req.params.photoId, req.body.visibility);
  ok(res, profile, "Photo visibility updated");
});

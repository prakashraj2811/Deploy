import { Router } from "express";
import multer from "multer";
import * as profileController from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  basicInfoSchema,
  careerSchema,
  educationSchema,
  familySchema,
  lifestyleSchema,
  partnerPreferenceSchema,
  privacySettingsSchema,
  photoVisibilitySchema,
} from "../validators/profile.validators";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.use(requireAuth);

router.get("/me", profileController.getMyProfile);
router.get("/:id", profileController.getProfileById);

router.put("/me/basic-info", validate({ body: basicInfoSchema }), profileController.updateBasicInfo);
router.put("/me/education", validate({ body: educationSchema }), profileController.updateEducation);
router.put("/me/career", validate({ body: careerSchema }), profileController.updateCareer);
router.put("/me/family", validate({ body: familySchema }), profileController.updateFamily);
router.put("/me/lifestyle", validate({ body: lifestyleSchema }), profileController.updateLifestyle);
router.put("/me/partner-preference", validate({ body: partnerPreferenceSchema }), profileController.updatePartnerPreference);
router.put("/me/privacy", validate({ body: privacySettingsSchema }), profileController.updatePrivacySettings);
router.post("/me/submit-verification", profileController.submitForVerification);

router.post("/me/photos", upload.single("photo"), profileController.uploadPhoto);
router.delete("/me/photos/:photoId", profileController.deletePhoto);
router.put("/me/photos/:photoId/primary", profileController.setPrimaryPhoto);
router.put("/me/photos/:photoId/visibility", validate({ body: photoVisibilitySchema }), profileController.updatePhotoVisibility);

export default router;

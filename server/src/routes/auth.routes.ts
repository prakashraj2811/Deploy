import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.validators";

const router = Router();

const authRateLimit = rateLimit({ windowMs: 15 * 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
const otpRateLimit = rateLimit({ windowMs: 10 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

router.post("/register", authRateLimit, validate({ body: registerSchema }), authController.register);
router.post("/verify-otp", otpRateLimit, validate({ body: verifyOtpSchema }), authController.verifyOtp);
router.post("/resend-otp", otpRateLimit, validate({ body: resendOtpSchema }), authController.resendOtp);
router.post("/login", authRateLimit, validate({ body: loginSchema }), authController.login);
router.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
router.post("/logout", authController.logout);
router.post("/change-password", requireAuth, validate({ body: changePasswordSchema }), authController.changePassword);
router.post("/forgot-password", authRateLimit, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/reset-password", authRateLimit, validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;

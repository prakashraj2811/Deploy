import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2, CheckCircle2 } from "lucide-react";
import * as authService from "@/services/auth.service";
import { extractErrorMessage } from "@/services/apiClient";

const accountSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    mobile: z.string().min(8, "Enter a valid mobile number"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type AccountValues = z.infer<typeof accountSchema>;

const otpSchema = z.object({
  mobileCode: z.string().length(6, "Enter the 6-digit code"),
  emailCode: z.string().length(6, "Enter the 6-digit code"),
});
type OtpValues = z.infer<typeof otpSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"account" | "verify" | "done">("account");
  const [account, setAccount] = useState<{ email: string; mobile: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const accountForm = useForm<AccountValues>({ resolver: zodResolver(accountSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  async function onCreateAccount(values: AccountValues) {
    setServerError(null);
    try {
      await authService.register({ email: values.email, mobile: values.mobile, password: values.password });
      setAccount({ email: values.email, mobile: values.mobile });
      setStage("verify");
    } catch (error) {
      setServerError(extractErrorMessage(error, "Could not create your account."));
    }
  }

  async function onVerify(values: OtpValues) {
    if (!account) return;
    setServerError(null);
    try {
      await authService.verifyOtp({ identifier: account.mobile, code: values.mobileCode, purpose: "REGISTRATION_MOBILE" });
      await authService.verifyOtp({ identifier: account.email, code: values.emailCode, purpose: "REGISTRATION_EMAIL" });
      setStage("done");
    } catch (error) {
      setServerError(extractErrorMessage(error, "Verification failed. Please check the codes and try again."));
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
            <Heart className="h-6 w-6" fill="currentColor" strokeWidth={0} />
          </span>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {stage === "account" && "Create your free account"}
            {stage === "verify" && "Verify your details"}
            {stage === "done" && "You're all set!"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {stage === "account" && "Step 1 of 9 — takes less than a minute."}
            {stage === "verify" && "We sent codes to your email and mobile number."}
            {stage === "done" && "Sign in to complete building your profile."}
          </p>
        </div>

        {stage === "account" && (
          <form onSubmit={accountForm.handleSubmit(onCreateAccount)} className="card space-y-4 p-6">
            {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
            <div>
              <label className="label">Email</label>
              <input className="input" placeholder="you@example.com" {...accountForm.register("email")} />
              {accountForm.formState.errors.email && <p className="mt-1 text-xs text-red-600">{accountForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <input className="input" placeholder="+91 98765 43210" {...accountForm.register("mobile")} />
              {accountForm.formState.errors.mobile && <p className="mt-1 text-xs text-red-600">{accountForm.formState.errors.mobile.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" {...accountForm.register("password")} />
              {accountForm.formState.errors.password && <p className="mt-1 text-xs text-red-600">{accountForm.formState.errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" {...accountForm.register("confirmPassword")} />
              {accountForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{accountForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={accountForm.formState.isSubmitting} className="btn-primary w-full">
              {accountForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>
        )}

        {stage === "verify" && (
          <form onSubmit={otpForm.handleSubmit(onVerify)} className="card space-y-4 p-6">
            {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
            <div>
              <label className="label">Mobile Verification Code</label>
              <input className="input" maxLength={6} placeholder="123456" {...otpForm.register("mobileCode")} />
              {otpForm.formState.errors.mobileCode && <p className="mt-1 text-xs text-red-600">{otpForm.formState.errors.mobileCode.message}</p>}
            </div>
            <div>
              <label className="label">Email Verification Code</label>
              <input className="input" maxLength={6} placeholder="123456" {...otpForm.register("emailCode")} />
              {otpForm.formState.errors.emailCode && <p className="mt-1 text-xs text-red-600">{otpForm.formState.errors.emailCode.message}</p>}
            </div>
            <button type="submit" disabled={otpForm.formState.isSubmitting} className="btn-primary w-full">
              {otpForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify & Continue
            </button>
          </form>
        )}

        {stage === "done" && (
          <div className="card space-y-5 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="text-sm text-ink-600">Your account is verified. Sign in to start building your profile.</p>
            <button className="btn-primary w-full" onClick={() => navigate("/login")}>
              Continue to Sign In
            </button>
          </div>
        )}

        {stage === "account" && (
          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

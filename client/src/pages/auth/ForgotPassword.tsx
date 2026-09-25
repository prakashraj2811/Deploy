import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import * as authService from "@/services/auth.service";
import { extractErrorMessage } from "@/services/apiClient";

const requestSchema = z.object({ identifier: z.string().min(3, "Enter your email or mobile number") });
const resetSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(8, "At least 8 characters"),
});

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const requestForm = useForm<z.infer<typeof requestSchema>>({ resolver: zodResolver(requestSchema) });
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  async function onRequest(values: z.infer<typeof requestSchema>) {
    setServerError(null);
    try {
      await authService.forgotPassword(values.identifier);
      setSentTo(values.identifier);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  async function onReset(values: z.infer<typeof resetSchema>) {
    if (!sentTo) return;
    setServerError(null);
    try {
      await authService.resetPassword({ identifier: sentTo, code: values.code, newPassword: values.newPassword });
      setDone(true);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-2xl font-bold text-ink-900">Reset your password</h1>

        {done ? (
          <div className="card mt-8 p-6 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 text-sm text-ink-600">Password reset successfully.</p>
            <Link to="/login" className="btn-primary mt-5 w-full">Sign In</Link>
          </div>
        ) : !sentTo ? (
          <form onSubmit={requestForm.handleSubmit(onRequest)} className="card mt-8 space-y-4 p-6">
            {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
            <div>
              <label className="label">Email or Mobile</label>
              <input className="input" {...requestForm.register("identifier")} />
              {requestForm.formState.errors.identifier && <p className="mt-1 text-xs text-red-600">{requestForm.formState.errors.identifier.message}</p>}
            </div>
            <button type="submit" disabled={requestForm.formState.isSubmitting} className="btn-primary w-full">
              {requestForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Code
            </button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onReset)} className="card mt-8 space-y-4 p-6">
            {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
            <p className="text-sm text-ink-500">Enter the code sent to <span className="font-medium text-ink-800">{sentTo}</span>.</p>
            <div>
              <label className="label">Verification Code</label>
              <input className="input" maxLength={6} {...resetForm.register("code")} />
              {resetForm.formState.errors.code && <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.code.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" {...resetForm.register("newPassword")} />
              {resetForm.formState.errors.newPassword && <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.newPassword.message}</p>}
            </div>
            <button type="submit" disabled={resetForm.formState.isSubmitting} className="btn-primary w-full">
              {resetForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

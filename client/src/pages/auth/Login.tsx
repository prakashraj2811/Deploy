import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import * as authService from "@/services/auth.service";
import * as userService from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/services/apiClient";

const schema = z.object({
  identifier: z.string().min(3, "Enter your email or mobile number"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const result = await authService.login(values);
      setSession(result.accessToken, { userId: result.userId, roles: result.roles, permissions: result.permissions });

      if (result.roles.some((r) => ["admin", "super_admin", "support"].includes(r))) {
        navigate("/admin");
        return;
      }

      const me = await userService.getMe();
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? (me.profile ? "/dashboard" : "/onboarding"));
    } catch (error) {
      setServerError(extractErrorMessage(error, "Unable to sign in. Please check your credentials."));
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
            <Heart className="h-6 w-6" fill="currentColor" strokeWidth={0} />
          </span>
          <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to continue your journey.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

          <div>
            <label className="label" htmlFor="identifier">Email or Mobile</label>
            <input id="identifier" className="input" placeholder="you@example.com" {...register("identifier")} />
            {errors.identifier && <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label mb-0" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">Forgot password?</Link>
            </div>
            <input id="password" type="password" className="input" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          New here? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}

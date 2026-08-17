"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/redux/features/auth/authApiSlice";
import { useLazyGetMeQuery } from "@/redux/features/user/userApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const isSafeRedirect = (path: string | null): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//");

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = isSafeRedirect(searchParams.get("redirect")) ? searchParams.get("redirect") : null;
  const redirectTo = explicitRedirect ?? "/admin";
  const [login, { isLoading: isSubmitting }] = useLoginMutation();
  const [fetchMe] = useLazyGetMeQuery();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setError(null);

    try {
      await login({ email, password }).unwrap();
      toast.success("Signed in successfully.");

      if (explicitRedirect) {
        router.push(explicitRedirect);
        // console.lgo
      } else {
        // No explicit destination — send admins to the dashboard and
        // everyone else to the storefront.
        const me = await fetchMe()
          .unwrap()
          .catch((fetchMeError) => {
            console.error("[login] could not fetch /auth/me to determine role:", fetchMeError);
            return null;
          });
          console.log("[login] fetched /auth/me:", me);
        if (!me) toast.warning("Signed in, but couldn't confirm your role — sending you to the storefront.");
        router.push(me?.data.role === "ADMIN" ? "/admin" : "/");
      }
    } catch (err) {
      let message = "Something went wrong. Please try again.";

      if (isFetchBaseQueryError(err)) {
        if (typeof err.status === "number") {
          message =
            (err.data as { message?: string } | undefined)?.message ??
            "Invalid email or password.";

          // The backend doesn't give us a distinct error code for this, so
          // we fall back to sniffing the message it sends for "unverified".
          if (/verify/i.test(message)) {
            toast.error(message);
            router.push(`/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`);
            return;
          }
        } else {
          // FETCH_ERROR / TIMEOUT_ERROR / PARSING_ERROR / CUSTOM_ERROR: the
          // request never got a real response from the server (e.g. CORS
          // block, network drop) — don't imply the credentials were wrong.
          message = "Network error. Please check your connection and try again.";
        }
      }

      setError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="email" className="text-white/80">
            Email address
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30 focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
          />
        </Field>

        <Field data-invalid={!!error}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password" className="text-white/80">
              Password
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-primary-normal hover:underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 border-white/15 bg-white/5 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-primary-normal"
            >
              <Icon
                icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"}
                className="h-4 w-4"
              />
            </button>
          </div>
        </Field>

        {error && <FieldError className="-mt-1">{error}</FieldError>}

        <Field orientation="horizontal">
          <Checkbox
            id="remember"
            name="remember"
            className="border-white/25 bg-transparent data-checked:border-primary-normal data-checked:bg-primary-normal data-checked:text-black"
          />
          <FieldLabel htmlFor="remember" className="font-normal text-white/60">
            Remember me for 30 days
          </FieldLabel>
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full bg-primary-normal text-sm font-semibold text-black hover:bg-primary-hover"
        >
          {isSubmitting ? (
            <>
              <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;

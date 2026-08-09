"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignupMutation } from "@/redux/features/auth/authApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const isSafeRedirect = (path: string | null): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//");

const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [signup, { isLoading: isSubmitting }] = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);

    try {
      const res = await signup({ name, email, password }).unwrap();
      toast.success(res.data?.message ?? "Account created. Check your email to verify it.");
      const verifyParams = new URLSearchParams({ email });
      if (isSafeRedirect(redirect)) verifyParams.set("redirect", redirect);
      router.push(`/verify-email?${verifyParams.toString()}`);
    } catch (err) {
      let message = "Something went wrong. Please try again.";

      if (isFetchBaseQueryError(err)) {
        if (typeof err.status === "number") {
          message =
            (err.data as { message?: string } | undefined)?.message ??
            "Could not create your account.";
        } else {
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
          <FieldLabel htmlFor="name" className="text-white/80">
            Full name
          </FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jordan Rivera"
            className="h-11 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30 focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
          />
        </Field>

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
          <FieldLabel htmlFor="password" className="text-white/80">
            Password
          </FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full bg-primary-normal text-sm font-semibold text-black hover:bg-primary-hover"
        >
          {isSubmitting ? (
            <>
              <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-[11px] text-white/40">
          By creating an account you confirm you are 21+ and agree to our{" "}
          <Link href="/age-verification-policy" className="text-primary-normal hover:underline underline-offset-4">
            Age Verification Policy
          </Link>
          .
        </p>
      </FieldGroup>
    </form>
  );
};

export default RegisterForm;

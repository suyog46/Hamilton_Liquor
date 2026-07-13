"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRouter } from "next/navigation";

const LoginForm = () => {


  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1200);

    router.push("/dashboard");
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
          className="h-11 w-full bg-primary-normal text-sm font-semibold text-black hover:bg-primary-normal/90"
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

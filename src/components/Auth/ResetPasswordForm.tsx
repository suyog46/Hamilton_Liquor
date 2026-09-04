"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useResetPasswordMutation } from "@/redux/features/auth/authApiSlice";

const getErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "Could not reset your password.";
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ?? data?.message ?? "Could not reset your password."
  );
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return toast.error("This reset link is missing its token.");
    if (password.length < 8)
      return toast.error("Password must be at least 8 characters.");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match.");
    try {
      const response = await resetPassword({ token, password }).unwrap();
      toast.success(response.data?.message ?? "Password reset successfully.");
      router.push("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black px-6 py-16">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary-normal/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center">
          <span className="font-title text-2xl font-bold tracking-wide text-primary-normal">
            Liquor
          </span>
        </Link>
        <div className="border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-title text-2xl font-semibold text-white">
              Create a new password
            </h1>
            <p className="mt-2 text-xs text-white/50">
              Choose a strong password for your account.
            </p>
          </div>
          {token ? (
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm text-white/80">
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-sm text-white/80"
                >
                  Confirm password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  className="h-11 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-primary-normal text-sm font-semibold text-black hover:bg-primary-hover"
              >
                {isLoading && (
                  <Icon icon="svg-spinners:180-ring" className="size-4" />
                )}
                {isLoading ? "Updating…" : "Reset password"}
              </Button>
            </form>
          ) : (
            <p className="text-center text-sm text-destructive">
              This password reset link is invalid or incomplete.
            </p>
          )}
        </div>
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1 text-xs text-white/40 hover:text-primary-normal"
        >
          <Icon icon="solar:arrow-left-linear" className="size-3.5" />
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

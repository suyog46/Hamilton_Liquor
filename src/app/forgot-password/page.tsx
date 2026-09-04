"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApiSlice";

const getErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "Could not send the reset email.";
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ?? data?.message ?? "Could not send the reset email."
  );
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }
    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      setConfirmationMessage(response.data.message);
      setSent(true);
      toast.success(response.data.message);
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
          {sent ? (
            <div className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-normal/10 text-primary-normal">
                <Icon icon="solar:letter-opened-linear" className="size-6" />
              </span>
              <h1 className="mt-5 font-title text-2xl font-semibold text-white">
                Check your email
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {confirmationMessage}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-6 w-full"
                onClick={() => setSent(false)}
              >
                Send again
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-title text-2xl font-semibold text-white">
                  Forgot password?
                </h1>
                <p className="mt-2 text-xs text-white/50">
                  Enter your email and we&apos;ll send you a secure reset link.
                </p>
              </div>
              <form onSubmit={submit} className="space-y-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm text-white/80">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
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
                  {isLoading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
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

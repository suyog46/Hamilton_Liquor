"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/redux/features/auth/authApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const isSafeRedirect = (path: string | null): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//");

const extractMessage = (err: unknown, fallback: string) => {
  if (isFetchBaseQueryError(err) && typeof err.status === "number") {
    return (err.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return "Network error. Please check your connection and try again.";
};

const VerifyEmailView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect");
  const loginHref = isSafeRedirect(redirect) ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(searchParams.get("email") ?? "");
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        const res = await verifyEmail({ token }).unwrap();
        setStatus("success");
        setMessage(res.data?.message ?? "Your email has been verified.");
        toast.success("Email verified — redirecting you to sign in...");
        setTimeout(() => router.push(loginHref), 2500);
      } catch (err) {
        setStatus("error");
        setMessage(extractMessage(err, "This verification link is invalid or has expired."));
      }
    })();
    // loginHref is derived from searchParams, which is stable for the life of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resendEmail) return;

    try {
      const res = await resendVerification({ email: resendEmail }).unwrap();
      toast.success(res.data?.message ?? "Verification email sent — check your inbox.");
    } catch (err) {
      toast.error(extractMessage(err, "Could not resend the verification email."));
    }
  };

  const resendForm = (
    <form onSubmit={handleResend} className="mt-6 flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="resend-email" className="text-white/80">
          Email address
        </FieldLabel>
        <Input
          id="resend-email"
          type="email"
          required
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30 focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
        />
      </Field>
      <Button
        type="submit"
        disabled={isResending}
        variant="outline"
        className="h-11 w-full border-white/15 bg-transparent text-sm font-semibold text-white hover:bg-white/5"
      >
        {isResending ? (
          <>
            <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />
            Sending...
          </>
        ) : (
          "Resend verification email"
        )}
      </Button>
    </form>
  );

  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black px-6 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary-normal/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center">
          <span className="font-title text-2xl font-bold tracking-wide text-primary-normal">Liquor</span>
        </Link>

        <div className="border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm sm:p-10">
          {!token ? (
            <>
              <Icon icon="solar:letter-unread-linear" className="mx-auto h-10 w-10 text-primary-normal" />
              <h1 className="font-title mt-4 text-2xl font-semibold text-white">Check your inbox</h1>
              <p className="mt-2 text-xs text-white/50">
                {resendEmail
                  ? `We sent a verification link to ${resendEmail}. Click it to activate your account.`
                  : "We sent a verification link to your email. Click it to activate your account."}
              </p>
              <FieldGroup>{resendForm}</FieldGroup>
            </>
          ) : status === "pending" || isVerifying ? (
            <>
              <Icon icon="svg-spinners:180-ring" className="mx-auto h-10 w-10 text-primary-normal" />
              <h1 className="font-title mt-4 text-2xl font-semibold text-white">Verifying your email...</h1>
              <p className="mt-2 text-xs text-white/50">This will just take a moment.</p>
            </>
          ) : status === "success" ? (
            <>
              <Icon icon="solar:check-circle-bold" className="mx-auto h-10 w-10 text-primary-normal" />
              <h1 className="font-title mt-4 text-2xl font-semibold text-white">Email verified</h1>
              <p className="mt-2 text-xs text-white/50">{message}</p>
              <Link
                href={loginHref}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-none bg-primary-normal text-sm font-semibold text-black hover:bg-primary-hover"
              >
                Continue to sign in
              </Link>
            </>
          ) : (
            <>
              <Icon icon="solar:danger-circle-bold" className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="font-title mt-4 text-2xl font-semibold text-white">Verification failed</h1>
              <p className="mt-2 text-xs text-white/50">{message}</p>
              <FieldGroup>{resendForm}</FieldGroup>
            </>
          )}
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1 text-xs text-white/40 transition-colors hover:text-primary-normal"
        >
          <Icon icon="solar:arrow-left-linear" className="h-3.5 w-3.5" />
          Back to store
        </Link>
      </div>
    </main>
  );
};

export default VerifyEmailView;

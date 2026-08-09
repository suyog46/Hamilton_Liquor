import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@iconify/react";
import RegisterForm from "@/components/Auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | Liquor",
  description: "Create a Liquor account to manage orders, track deliveries, and shop faster.",
};

const isSafeRedirect = (path: string | undefined): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//");

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

const RegisterPage = async ({ searchParams }: RegisterPageProps) => {
  const { redirect } = await searchParams;
  const loginHref = isSafeRedirect(redirect) ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";

  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black px-6 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary-normal/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center">
          <span className="font-title text-2xl font-bold tracking-wide text-primary-normal">
            Liquor
          </span>
        </Link>

        <div className="border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-title text-2xl font-semibold text-white">Create your account</h1>
            <p className="mt-2 text-xs text-white/50">
              Sign up to manage your orders and reorder your favorites.
            </p>
          </div>

          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link href={loginHref} className="text-primary-normal hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>

        <Link
          href="/"
          className="mt-3 flex items-center justify-center gap-1 text-xs text-white/40 transition-colors hover:text-primary-normal"
        >
          <Icon icon="solar:arrow-left-linear" className="h-3.5 w-3.5" />
          Back to store
        </Link>
      </div>
    </main>
  );
};

export default RegisterPage;

import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailView from "@/components/Auth/VerifyEmailView";

export const metadata: Metadata = {
  title: "Verify Your Email | Liquor",
  description: "Verify your email address to activate your Liquor account.",
};

const VerifyEmailPage = () => (
  <Suspense fallback={null}>
    <VerifyEmailView />
  </Suspense>
);

export default VerifyEmailPage;

import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Liquor",
  description: "Create a new password for your Liquor account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

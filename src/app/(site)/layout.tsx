import { cookies } from "next/headers";
import AgeGate from "@/components/Common/AgeGate/AgeGate";
import AosProvider from "@/components/Common/AosProvider/AosProvider";
import Footer from "@/components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import TopBar from "@/components/Common/TopBar/TopBar";
import { AGE_GATE_COOKIE_NAME } from "@/lib/utils";
import { AgeVerificationProvider } from "@/lib/context/AgeVerification";
import React from "react";

const SiteLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const isAgeVerified = cookieStore.get(AGE_GATE_COOKIE_NAME)?.value === "true";

  return (
    <AgeVerificationProvider initiallyVerified={isAgeVerified}>
      <AosProvider />
      <AgeGate initiallyVerified={isAgeVerified} />
      <TopBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </AgeVerificationProvider>
  );
};

export default SiteLayout;

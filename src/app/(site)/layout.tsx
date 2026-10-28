import { cookies } from "next/headers";
import AgeGate from "@/components/Common/AgeGate/AgeGate";
import AosProvider from "@/components/Common/AosProvider/AosProvider";
import Footer from "@/components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import TopBar from "@/components/Common/TopBar/TopBar";
import { AGE_GATE_COOKIE_NAME, SALE_DIALOG_COOKIE_NAME } from "@/lib/utils";
import { AgeVerificationProvider } from "@/lib/context/AgeVerification";
import React from "react";
import CartSheet from "@/components/Common/CartSheet/CartSheet";
import MaintenanceNotice from "@/components/Common/MaintenanceNotice/MaintenanceNotice";
import SaleDialog from "@/components/Common/SaleDialog/SaleDialog";

import { getStoreData } from "@/lib/api/store";

const SiteLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const isAgeVerified = cookieStore.get(AGE_GATE_COOKIE_NAME)?.value === "true";
  const isSaleDismissed = cookieStore.get(SALE_DIALOG_COOKIE_NAME)?.value === "true";

  const { information, location, hours, socialLinks } = await getStoreData();

  return (
    <AgeVerificationProvider initiallyVerified={isAgeVerified}>
      <AosProvider />
      <AgeGate initiallyVerified={isAgeVerified} />
      <SaleDialog initiallyDismissed={isSaleDismissed} />
      {/* <MaintenanceNotice /> */}
      <TopBar information={information} location={location} hours={hours} />
      <Navbar information={information} location={location} hours={hours} />
      <CartSheet />
      <main className="min-h-screen">{children}</main>
      <Footer
        information={information}
        location={location}
        hours={hours}
        socialLinks={socialLinks}
      />
    </AgeVerificationProvider>
  );
};

export default SiteLayout;

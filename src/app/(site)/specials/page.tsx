"use client";

import PageBanner from "@/components/Common/PageBanner/PageBanner";
import SaleSection from "@/components/HomeSection/SaleSection/SaleSection";

export default function SpecialsPage() {
  return (
    <main className="min-h-screen bg-[#181512] text-white">
      <PageBanner
        title="Weekly Specials & On Sale"
        subtitle="Exclusive discounts on top-shelf spirits, fine wines, and craft beers."
      />

      <div className="py-12">
        <SaleSection />
      </div>
    </main>
  );
}

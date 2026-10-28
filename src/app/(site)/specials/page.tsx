import PageBanner from "@/components/Common/PageBanner/PageBanner";
import SaleSection from "@/components/HomeSection/SaleSection/SaleSection";
import { core } from "@/lib/api/core";
import type { PublicSaleItem, PublicSaleListResponse } from "@/redux/features/sale/saleApiSlice";

const getSales = async (): Promise<PublicSaleItem[]> => {
  const res = await core("sales?limit=50");
  if (!res.ok) return [];
  const json: PublicSaleListResponse = await res.json();
  return json.data.items ?? [];
};

export default async function SpecialsPage() {
  const sales = await getSales();

  return (
    <main className="min-h-screen bg-[#181512] text-white">
      <PageBanner
        title="Weekly Specials & On Sale"
        subtitle="Exclusive discounts on top-shelf spirits, fine wines, and craft beers."
      />

      <div className="py-12">
        <SaleSection items={sales} />
      </div>
    </main>
  );
}

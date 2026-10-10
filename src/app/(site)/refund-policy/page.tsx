import type { Metadata } from "next";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import RefundPolicy from "@/components/Common/RefundPolicy/RefundPolicy";

export const metadata: Metadata = {
  title: "Refund & Return Policy | Hamilton Liquor Store",
  description:
    "Review the Hamilton Liquor Store Refund & Return Policy for Maryland alcohol sales, pickup, delivery, order cancellations, and return eligibility.",
};

const RefundPolicyPage = () => {
  return (
    <>
      <PageBanner
        eyebrow="Policy"
        title="Refund & Return Policy"
        subtitle="Review our conditions for refunds, unopened returns, damaged items, cancellations, and processing times."
        breadcrumbs={[{ name: "Refund & Return Policy" }]}
      />
      <section className="bg-white">
        <RefundPolicy />
      </section>
    </>
  );
};

export default RefundPolicyPage;

import PageBanner from "@/components/Common/PageBanner/PageBanner";
import PolicyContent from "@/components/Common/PolicyContent/PolicyContent";

const sections = [
  {
    heading: "In-Store Pickup",
    body: [
      "Place your order online and choose a pickup time. Most orders are ready within 30–60 minutes. You'll receive a confirmation when your order is placed and a notification when it's ready.",
      "A valid government-issued photo ID is required at pickup, and the customer must be 21 or older. We may refuse pickup if ID cannot be verified.",
    ],
  },
  {
    heading: "Local Delivery",
    body: [
      "Delivery is offered only where legally permitted and operationally supported, within an approximate 2–2.5 mile radius of the store.",
      "Delivery fee is $4.99, waived for orders over $200. A $30 minimum order applies to all delivery orders.",
      "Delivery only takes place during legally allowed store operating hours, within our store-controlled delivery schedule.",
    ],
  },
  {
    heading: "ID & Age Verification at Delivery",
    body: [
      "A valid government-issued photo ID is required at the time of delivery, and the customer must be 21 or older. Alcohol cannot be left unattended.",
      "Delivery may be refused if ID is invalid, if the customer cannot be verified as 21+, or if the customer appears intoxicated.",
    ],
  },
  {
    heading: "Order Refusal & Cancellation",
    body: [
      "Hamilton Liquor Store may refuse or cancel any pickup or delivery order at its discretion if age or identity cannot be confirmed, consistent with our Age Verification Policy.",
    ],
  },
];

const PickupDeliveryPolicyPage = () => {
  return (
    <>
      <PageBanner
        eyebrow="Policy"
        title="Pickup & Delivery Policy"
        subtitle="What to expect when you choose in-store pickup or local delivery, including ID and age requirements."
        breadcrumbs={[{ name: "Pickup & Delivery Policy" }]}
      />
      <PolicyContent sections={sections} />
    </>
  );
};

export default PickupDeliveryPolicyPage;

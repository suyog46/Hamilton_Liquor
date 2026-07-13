import PageBanner from "@/components/Common/PageBanner/PageBanner";
import PolicyContent from "@/components/Common/PolicyContent/PolicyContent";

const sections = [
  {
    heading: "21+ Only",
    body: [
      "Hamilton Liquor Store sells alcohol only to customers who are 21 years of age or older. By browsing or ordering from this website, you confirm that you meet this age requirement.",
    ],
  },
  {
    heading: "ID Verification",
    body: [
      "A valid government-issued photo ID is required at the time of pickup or delivery. Acceptable forms of ID include a driver's license, state ID card, military ID, or passport.",
      "Our staff or delivery driver will check ID against the name on the order before handing over any alcohol.",
    ],
  },
  {
    heading: "Refusal of Service",
    body: [
      "We reserve the right to refuse, cancel, or delay any order if a customer's age cannot be verified, if the ID presented appears invalid, or if the customer appears to be intoxicated.",
    ],
  },
  {
    heading: "Checkout Confirmation",
    body: [
      "At checkout, customers will be asked to provide their date of birth and confirm, via checkbox, that they are 21 years of age or older before completing an order.",
    ],
  },
];

const AgeVerificationPolicyPage = () => {
  return (
    <>
      <PageBanner
        eyebrow="Policy"
        title="Age Verification Policy"
        subtitle="Alcohol sales are restricted to customers 21 and older. Here's how we verify age for every order."
        breadcrumbs={[{ name: "Age Verification Policy" }]}
      />
      <PolicyContent sections={sections} />
    </>
  );
};

export default AgeVerificationPolicyPage;

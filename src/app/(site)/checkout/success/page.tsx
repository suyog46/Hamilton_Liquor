import CheckoutSuccessView from "@/components/Checkout/CheckoutSuccessView";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { order_id: orderId } = await searchParams;
  return <CheckoutSuccessView orderId={orderId ?? ""} />;
}

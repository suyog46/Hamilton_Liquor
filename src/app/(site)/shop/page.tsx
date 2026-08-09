import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";

interface ShopAllPageProps {
  searchParams: Promise<{ category?: string }>;
}

const ShopAllPage = async ({ searchParams }: ShopAllPageProps) => {
  const { category } = await searchParams;

  return (
    <ProductGridTemplate
      eyebrow="Full Collection"
      title="Shop All"
      subtitle="Browse our entire range of wine, spirits, beer, and mixers — all in one place."
      initialCategory={category}
    />
  );
};

export default ShopAllPage;

import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { allProducts } from "@/lib/utils/products";

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
      products={allProducts}
      initialCategory={category}
    />
  );
};

export default ShopAllPage;

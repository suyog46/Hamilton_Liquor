import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { products } from "@/lib/utils/products";

const ShopAllPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Full Collection"
      title="Shop All"
      subtitle="Browse our entire range of wine, spirits, beer, and mixers — all in one place."
      products={products}
    />
  );
};

export default ShopAllPage;

import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { getProductsByCategory } from "@/lib/utils/products";

const WinePage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Category"
      title="Wine"
      subtitle="Reds, whites, and rosés from boutique vineyards and trusted classics."
      products={getProductsByCategory("Wine")}
    />
  );
};

export default WinePage;

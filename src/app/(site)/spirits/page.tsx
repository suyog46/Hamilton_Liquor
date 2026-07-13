import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { getProductsBySpirits } from "@/lib/utils/products";

const SpiritsPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Category"
      title="Spirits"
      subtitle="Whiskey, vodka, rum, and gin — from everyday pours to top-shelf reserves."
      products={getProductsBySpirits()}
    />
  );
};

export default SpiritsPage;

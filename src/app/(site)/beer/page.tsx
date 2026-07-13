import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { getProductsByCategory } from "@/lib/utils/products";

const BeerPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Category"
      title="Beer"
      subtitle="Craft lagers, IPAs, and pilsners from local and international breweries."
      products={getProductsByCategory("Beer")}
    />
  );
};

export default BeerPage;

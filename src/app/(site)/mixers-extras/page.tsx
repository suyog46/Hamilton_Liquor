import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { mixerAsProducts } from "@/lib/utils/products";

const MixersExtrasPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Category"
      title="Mixers & Extras"
      subtitle="Tonics, garnishes, bitters, and bar tools to round out your order."
      products={mixerAsProducts}
      searchPlaceholder="Search mixers & extras…"
    />
  );
};

export default MixersExtrasPage;

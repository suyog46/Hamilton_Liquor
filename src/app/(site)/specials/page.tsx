import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { getProductsByTag } from "@/lib/utils/products";

const SpecialsPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Limited Time"
      title="On Sale / Specials"
      subtitle="Weekly specials and markdowns across wine, spirits, and beer — while supplies last."
      products={getProductsByTag("on-sale")}
      searchPlaceholder="Search specials…"
    />
  );
};

export default SpecialsPage;

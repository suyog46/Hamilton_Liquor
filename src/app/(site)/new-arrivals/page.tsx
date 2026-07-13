import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";
import { getProductsByTag } from "@/lib/utils/products";

const NewArrivalsPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Just Landed"
      title="New Arrivals"
      subtitle="The latest bottles to hit our shelves, fresh from our favorite producers."
      products={getProductsByTag("new-arrival")}
    />
  );
};

export default NewArrivalsPage;

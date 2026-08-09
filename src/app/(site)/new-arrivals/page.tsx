import ProductGridTemplate from "@/components/Shop/ProductGridTemplate/ProductGridTemplate";

const NewArrivalsPage = () => {
  return (
    <ProductGridTemplate
      eyebrow="Just Landed"
      title="New Arrivals"
      subtitle="The latest bottles to hit our shelves, fresh from our favorite producers."
      defaultSortBy="created_at"
      defaultSortOrder="desc"
    />
  );
};

export default NewArrivalsPage;

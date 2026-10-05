import type { Product } from "@/redux/features/product/productApiSlice";

const LIQUOR_CATEGORY = "liquor";

export const isLiquorParentCategory = (product?: Product | null) => {
  if (!product) return true;

  const parent = product.category.parent;
  if (!parent) return false;

  return (
    parent.slug.toLowerCase() === LIQUOR_CATEGORY ||
    parent.name.toLowerCase() === LIQUOR_CATEGORY
  );
};

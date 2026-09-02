import type {
  PublicProduct,
  PublicProductVariant,
} from "@/redux/features/product/productApiSlice";

// Products can carry multiple variants (sizes); the detail page lets
// shoppers switch between them, defaulting to the cheapest in-stock one.
export const getDisplayVariant = (product: PublicProduct): PublicProductVariant | null => {
  if (product.variants.length === 0) return null;

  const inStock = product.variants.filter(
    (variant) => variant.is_active && variant.available_quantity > 0,
  );
  const active = product.variants.filter((variant) => variant.is_active);
  const pool = inStock.length > 0 ? inStock : active.length > 0 ? active : product.variants;

  return pool.reduce((cheapest, variant) =>
    Number(variant.price) < Number(cheapest.price) ? variant : cheapest
  );
};

export const isVariantInStock = (variant: PublicProductVariant | null | undefined) =>
  !!variant && variant.is_active && variant.available_quantity > 0;

export const isProductInStock = (product: PublicProduct) =>
  product.variants.some((variant) => isVariantInStock(variant));

export const formatPrice = (price: string | number) => `$${Number(price).toFixed(2)}`;

export const formatVolume = (volumeMl: number) =>
  volumeMl % 1000 === 0 ? `${volumeMl / 1000}L` : `${volumeMl}ml`;

export const formatAbv = (alcoholPercentage: string | number) => `${Number(alcoholPercentage)}% ABV`;

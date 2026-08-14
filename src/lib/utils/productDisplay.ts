import type { Product, ProductVariant } from "@/redux/features/product/productApiSlice";

// Products can carry multiple variants (sizes); the detail page lets
// shoppers switch between them, defaulting to the cheapest in-stock one.
export const getDisplayVariant = (product: Product): ProductVariant | null => {
  if (product.variants.length === 0) return null;

  const inStock = product.variants.filter((variant) => variant.is_active && variant.quantity > 0);
  const active = product.variants.filter((variant) => variant.is_active);
  const pool = inStock.length > 0 ? inStock : active.length > 0 ? active : product.variants;

  return pool.reduce((cheapest, variant) =>
    Number(variant.price) < Number(cheapest.price) ? variant : cheapest
  );
};

export const isVariantInStock = (variant: ProductVariant | null | undefined) =>
  !!variant && variant.is_active && variant.quantity > 0;

export const isProductInStock = (product: Product) =>
  product.variants.some((variant) => isVariantInStock(variant));

export const formatPrice = (price: string | number) => `$${Number(price).toFixed(2)}`;

export const formatVolume = (volumeMl: number) =>
  volumeMl % 1000 === 0 ? `${volumeMl / 1000}L` : `${volumeMl}ml`;

export const formatAbv = (alcoholPercentage: string | number) => `${Number(alcoholPercentage)}% ABV`;

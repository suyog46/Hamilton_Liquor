"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ProductDetailActions from "@/components/Shop/ProductDetailActions/ProductDetailActions";
import type { Product } from "@/redux/features/product/productApiSlice";
import {
  formatAbv,
  formatPrice,
  formatVolume,
  getDisplayVariant,
  isVariantInStock,
} from "@/lib/utils/productDisplay";

interface ProductDetailViewProps {
  product: Product;
  categoryHref: string;
}

const ProductDetailView = ({ product, categoryHref }: ProductDetailViewProps) => {
  const defaultVariant = getDisplayVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? product.variants[0]?.id);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const inStock = isVariantInStock(selectedVariant);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 pt-20 sm:pt-24">
        <nav
          aria-label="Breadcrumb"
          className="max-w-[1280px] mx-auto px-6 py-4 flex items-center flex-wrap gap-1.5 text-xs text-gray-500"
        >
          <Link href="/" className="hover:text-primary-normal transition-colors">
            Home
          </Link>
          <Icon icon="material-symbols:chevron-right" className="w-3.5 h-3.5 text-gray-300" />
          <Link href={categoryHref} className="hover:text-primary-normal transition-colors">
            {product.category.name}
          </Link>
          <Icon icon="material-symbols:chevron-right" className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-black font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product detail */}
      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative h-80 sm:h-[28rem] rounded-2xl overflow-hidden bg-gray-50">
            {selectedVariant?.media?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedVariant.media.url}
                alt={product.name}
                className={cn("absolute inset-0 h-full w-full object-cover", !inStock && "opacity-50 grayscale")}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <Icon icon="solar:bottle-linear" className="w-16 h-16" />
              </div>
            )}
            {!inStock && (
              <span className="absolute inset-x-0 bottom-0 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white bg-black/80">
                Out of Stock
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {product.brand.name}
              </span>
              <h1 className="font-title text-2xl sm:text-3xl font-bold text-black leading-tight mt-1">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-black">
                {selectedVariant ? formatPrice(selectedVariant.price) : "—"}
              </span>
              <Badge variant={inStock ? "secondary" : "destructive"}>
                {inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {product.variants.length > 1 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wide text-gray-400">Size</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;
                    const variantInStock = isVariantInStock(variant);
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={!variantInStock}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-semibold border transition-colors",
                          isSelected
                            ? "bg-black text-primary-normal border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300",
                          !variantInStock && "opacity-40 cursor-not-allowed line-through"
                        )}
                      >
                        {formatVolume(variant.volume_ml)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-gray-100">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Category</p>
                <p className="text-sm font-medium text-black">{product.category.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Brand</p>
                <p className="text-sm font-medium text-black">{product.brand.name}</p>
              </div>
              {selectedVariant && (
                <>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Size</p>
                    <p className="text-sm font-medium text-black">{formatVolume(selectedVariant.volume_ml)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">ABV</p>
                    <p className="text-sm font-medium text-black">{formatAbv(selectedVariant.alcohol_percentage)}</p>
                  </div>
                </>
              )}
              {product.country && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Origin</p>
                  <p className="text-sm font-medium text-black">{product.country.name}</p>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <ProductDetailActions key={selectedVariant?.id} variant={selectedVariant} />

            <div className="flex flex-col gap-2.5 mt-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon icon="solar:bag-check-outline" className="w-4.5 h-4.5 text-primary-normal shrink-0 mt-0.5" />
                Available for in-store pickup, usually ready within 30&ndash;60 minutes.
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon icon="solar:delivery-outline" className="w-4.5 h-4.5 text-primary-normal shrink-0 mt-0.5" />
                Local delivery available where legally permitted &mdash; see our{" "}
                <Link href="/pickup-delivery-policy" className="font-semibold text-primary-normal hover:opacity-80">
                  Pickup &amp; Delivery Policy
                </Link>
                .
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon icon="solar:shield-check-linear" className="w-4.5 h-4.5 text-primary-normal shrink-0 mt-0.5" />
                Must be 21+ with a valid government-issued photo ID at pickup or delivery.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailView;

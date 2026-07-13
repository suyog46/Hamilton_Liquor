"use client";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/utils/products";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const badgeLabels: Record<string, string> = {
  "on-sale": "On Sale",
  "best-seller": "Best Seller",
  "staff-pick": "Staff Pick",
  "new-arrival": "New",
};

const ProductCard = ({ product }: { product: Product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [inCart, setInCart] = useState(false);
  const primaryTag = product.tags?.[0];

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Like button */}
      <button
        aria-label="Add to wishlist"
        onClick={() => setIsLiked((prev) => !prev)}
        className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-sm hover:scale-105 transition-transform"
      >
        <Icon
          icon={isLiked ? "solar:heart-bold" : "solar:heart-outline"}
          className={cn("w-5 h-5", isLiked ? "text-red-500" : "text-gray-500")}
        />
      </button>

      <Link href={`/shop/${product.id}`} className="contents">
        {/* Product image */}
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover group-hover:scale-105 transition-transform duration-300",
              !product.inStock && "opacity-50 grayscale"
            )}
          />
          <span className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wide text-primary-normal bg-black/80 px-2 py-1 rounded-full">
            {product.category}
          </span>
          {primaryTag && (
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-wide text-black bg-primary-normal px-2 py-1 rounded-full">
              {badgeLabels[primaryTag]}
            </span>
          )}
          {!product.inStock && (
            <span className="absolute inset-x-0 bottom-0 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white bg-black/80">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-4 pt-4 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide truncate">{product.brand}</span>
          <h3 className="font-title text-base font-semibold text-black truncate">{product.name}</h3>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{product.volume}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{product.abv} ABV</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1 text-gray-700">
              <Icon icon="solar:star-bold" className="w-3.5 h-3.5 text-yellow-500" />
              {product.rating}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-black">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => product.inStock && setInCart((prev) => !prev)}
            disabled={!product.inStock}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              !product.inStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : inCart
                ? "bg-black text-white"
                : "bg-primary-normal text-black hover:opacity-90"
            )}
          >
            <Icon icon={inCart ? "solar:check-circle-bold" : "solar:cart-plus-outline"} className="w-4 h-4" />
            {!product.inStock ? "Sold Out" : inCart ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

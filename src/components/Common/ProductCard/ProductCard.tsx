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
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]   ">
      {/* Like button */}
      <button
        aria-label="Add to wishlist"
        onClick={() => setIsLiked((prev) => !prev)}
        className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:scale-105 transition-transform"
      >
        <Icon
          icon={isLiked ? "solar:heart-bold" : "solar:heart-outline"}
          className={cn("w-5 h-5", isLiked ? "text-red-500" : "text-gray-500")}
        />
      </button>

      <Link href={`/shop/${product.id}`} className="contents">
        {/* Product image */}
        <div className="relative h-72 sm:h-80 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out",
              !product.inStock && "opacity-50 grayscale"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

          <span className="absolute top-4 left-4 text-[11px] font-semibold uppercase tracking-wide text-primary-normal bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {product.category}
          </span>
          {primaryTag && (
            <span className="absolute bottom-4 left-4 text-[11px] font-semibold uppercase tracking-wide text-black bg-primary-normal px-2.5 py-1 rounded-full">
              {badgeLabels[primaryTag]}
            </span>
          )}
          {!product.inStock && (
            <span className="absolute inset-x-0 bottom-0 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white bg-black/80">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-5 pt-5 flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide truncate">{product.brand}</span>
          <h3 className="font-title text-lg font-semibold text-black leading-snug truncate">{product.name}</h3>

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

      <div className="px-5 pb-5 mt-3">
        <div className="h-px bg-gray-100 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-black">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button
            aria-label={!product.inStock ? "Sold out" : inCart ? "Added to cart" : "Add to cart"}
            onClick={() => product.inStock && setInCart((prev) => !prev)}
            disabled={!product.inStock}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-full transition-colors shadow-sm",
              !product.inStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : inCart
                ? "bg-black text-white"
                : "bg-primary-normal text-black hover:opacity-90"
            )}
          >
            <Icon icon={inCart ? "solar:check-circle-bold" : "solar:cart-plus-outline"} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

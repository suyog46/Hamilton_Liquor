"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/utils/products";

const ProductDetailActions = ({ product }: { product: Product }) => {
  const [qty, setQty] = useState(1);
  const [inCart, setInCart] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</span>
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 px-3 py-2">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            disabled={!product.inStock}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            <Icon icon="solar:minus-circle-linear" className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold w-5 text-center">{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQty((prev) => Math.min(24, prev + 1))}
            disabled={!product.inStock}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            <Icon icon="solar:add-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={() => product.inStock && setInCart(true)}
        disabled={!product.inStock}
        className={cn(
          "flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto sm:px-10",
          !product.inStock
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : inCart
            ? "bg-black text-white"
            : "bg-primary-normal text-black hover:opacity-90"
        )}
      >
        <Icon icon={inCart ? "solar:check-circle-bold" : "solar:cart-plus-outline"} className="w-5 h-5" />
        {!product.inStock ? "Sold Out" : inCart ? `Added ${qty} to Cart` : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductDetailActions;

'use client';

import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/utils/products";
import { useState } from "react";

interface ProductGridTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
  searchPlaceholder?: string;
}

const sortOptions = ["Popularity", "Price: Low to High", "Price: High to Low", "Top Rated"];
const filterChips = ["All", "Whiskey", "Wine", "Vodka", "Rum", "Gin", "Beer"];


const ProductGridTemplate = ({
  eyebrow,
  title,
  subtitle,
  products,
  searchPlaceholder = "Search products…",
}: ProductGridTemplateProps) => {
  const [activeChip ,setActiveChip] = useState<string>("All");
  
  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} subtitle={subtitle} breadcrumbs={[{ name: title }]} />

      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Search bar */}
          <div className="relative mb-6">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-xl pl-11 pr-4 text-sm border-gray-200 bg-gray-50"
            />
          </div>

          {/* Filter + sort row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {filterChips.map((chip, i) => (
                <span
                  key={chip}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border cursor-pointer ${
                    chip === activeChip
                      ? "bg-black text-primary-normal border-black"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                  onClick={() => setActiveChip(chip)}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap">Sort by</span>
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
                {sortOptions[0]}
                <Icon icon="solar:alt-arrow-down-linear" className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{products.length} products</p>
            <Badge className="hidden sm:inline-flex bg-gray-100 text-gray-600">21+ Age Verified</Badge>
          </div>

          {/* Product grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Icon icon="solar:box-minimalistic-linear" className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-400">No products in this collection yet — check back soon.</p>
            </div>
          )}

          {/* Pagination */}
          {products.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400">
                <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
              </span>
              {[1, 2, 3].map((page) => (
                <span
                  key={page}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium ${
                    page === 1 ? "bg-primary-normal text-black" : "border border-gray-200 text-gray-600"
                  }`}
                >
                  {page}
                </span>
              ))}
              <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600">
                <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductGridTemplate;

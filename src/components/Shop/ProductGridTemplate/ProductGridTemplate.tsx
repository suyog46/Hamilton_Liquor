"use client";

import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getTopCategory, type Product, type TopCategory } from "@/lib/utils/products";
import { useMemo, useState } from "react";

interface ProductGridTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
  searchPlaceholder?: string;
  initialCategory?: string;
}

type SortOption = "Popularity" | "Price: Low to High" | "Price: High to Low" | "Top Rated";
type PriceBucket = "all" | "under30" | "30to60" | "over60";

const sortOptions: SortOption[] = ["Popularity", "Price: Low to High", "Price: High to Low", "Top Rated"];

const priceBuckets: { value: PriceBucket; label: string }[] = [
  { value: "all", label: "Any Price" },
  { value: "under30", label: "Under $30" },
  { value: "30to60", label: "$30 – $60" },
  { value: "over60", label: "$60+" },
];

const categoryOrder: TopCategory[] = ["Wine", "Spirits", "Beer", "Mixer"];
const categoryLabels: Record<TopCategory, string> = {
  Wine: "Wine",
  Spirits: "Spirits",
  Beer: "Beer",
  Mixer: "Mixers & Extras",
};

const isValidCategory = (value: string | undefined): value is TopCategory =>
  !!value && categoryOrder.includes(value as TopCategory);

const matchesPriceBucket = (price: number, bucket: PriceBucket) => {
  if (bucket === "under30") return price < 30;
  if (bucket === "30to60") return price >= 30 && price <= 60;
  if (bucket === "over60") return price > 60;
  return true;
};

const ProductGridTemplate = ({
  eyebrow,
  title,
  subtitle,
  products,
  searchPlaceholder = "Search products…",
  initialCategory,
}: ProductGridTemplateProps) => {
  const availableCategories = useMemo(
    () => categoryOrder.filter((category) => products.some((product) => getTopCategory(product) === category)),
    [products]
  );

  const [activeCategory, setActiveCategory] = useState<"All" | TopCategory>(
    isValidCategory(initialCategory) ? initialCategory : "All"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Popularity");
  const [priceBucket, setPriceBucket] = useState<PriceBucket>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (activeCategory !== "All" && getTopCategory(product) !== activeCategory) return false;
      if (inStockOnly && !product.inStock) return false;
      if (!matchesPriceBucket(product.price, priceBucket)) return false;
      if (query) {
        const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortOption === "Price: Low to High") sorted.sort((a, b) => a.price - b.price);
    else if (sortOption === "Price: High to Low") sorted.sort((a, b) => b.price - a.price);
    else if (sortOption === "Top Rated") sorted.sort((a, b) => b.rating - a.rating);

    return sorted;
  }, [products, activeCategory, searchTerm, sortOption, priceBucket, inStockOnly]);

  const activeFilterCount = (priceBucket !== "all" ? 1 : 0) + (inStockOnly ? 1 : 0);

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-xl pl-11 pr-4 text-sm border-gray-200 bg-gray-50"
            />
          </div>

          {/* Filter + sort row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {(["All", ...availableCategories] as const).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                    chip === activeCategory
                      ? "bg-black text-primary-normal border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveCategory(chip)}
                >
                  {chip === "All" ? "All" : categoryLabels[chip]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  filtersOpen || activeFilterCount > 0
                    ? "border-primary-normal text-primary-normal bg-primary-normal/5"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <Icon icon="solar:tuning-2-linear" className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary-normal text-black text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
                <span className="text-gray-400 whitespace-nowrap hidden md:inline">Sort by</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-transparent outline-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Expandable filter panel */}
          {filtersOpen && (
            <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6 p-4 sm:p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price</span>
                <div className="flex flex-wrap gap-2">
                  {priceBuckets.map((bucket) => (
                    <button
                      key={bucket.value}
                      type="button"
                      onClick={() => setPriceBucket(bucket.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                        priceBucket === bucket.value
                          ? "bg-primary-normal text-black border-primary-normal"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {bucket.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Availability</span>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Checkbox checked={inStockOnly} onCheckedChange={setInStockOnly} />
                  In stock only
                </label>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceBucket("all");
                    setInStockOnly(false);
                  }}
                  className="sm:ml-auto text-xs font-semibold text-primary-normal hover:opacity-80 self-start"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{filteredProducts.length} products</p>
            <Badge className="hidden sm:inline-flex bg-gray-100 text-gray-600">21+ Age Verified</Badge>
          </div>

          {/* Product grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Icon icon="solar:box-minimalistic-linear" className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-400">No products match your filters — try adjusting them.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductGridTemplate;

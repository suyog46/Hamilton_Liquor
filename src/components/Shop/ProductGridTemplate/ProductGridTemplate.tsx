"use client";

import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetPublicProductsQuery } from "@/redux/features/product/productApiSlice";
import { useEffect, useMemo, useState } from "react";

interface ProductGridTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  initialCategory?: string;
  defaultSortBy?: "created_at" | "name";
  defaultSortOrder?: "asc" | "desc";
}

const PAGE_SIZE = 12;

type SortValue = "newest" | "name_asc" | "name_desc";
type PriceBucket = "all" | "under30" | "30to60" | "over60";

const sortOptions: { value: SortValue; label: string; sort_by: "created_at" | "name"; sort_order: "asc" | "desc" }[] = [
  { value: "newest", label: "Newest", sort_by: "created_at", sort_order: "desc" },
  { value: "name_asc", label: "Name: A–Z", sort_by: "name", sort_order: "asc" },
  { value: "name_desc", label: "Name: Z–A", sort_by: "name", sort_order: "desc" },
];

const priceBuckets: { value: PriceBucket; label: string; min?: number; max?: number }[] = [
  { value: "all", label: "Any Price" },
  { value: "under30", label: "Under $30", max: 30 },
  { value: "30to60", label: "$30 – $60", min: 30, max: 60 },
  { value: "over60", label: "$60+", min: 60 },
];

const resolveDefaultSort = (sortBy?: "created_at" | "name", sortOrder?: "asc" | "desc"): SortValue => {
  const match = sortOptions.find((opt) => opt.sort_by === sortBy && opt.sort_order === (sortOrder ?? "desc"));
  return match?.value ?? "newest";
};

const ProductGridTemplate = ({
  eyebrow,
  title,
  subtitle,
  searchPlaceholder = "Search products…",
  initialCategory,
  defaultSortBy,
  defaultSortOrder,
}: ProductGridTemplateProps) => {
  const { data: categoryData } = useGetPublicCategoriesQuery({ limit: 50 });
  const categories = (categoryData?.data.items ?? []).filter((category) => category.is_active);

  const [activeCategory, setActiveCategory] = useState(initialCategory ?? "all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortValue>(resolveDefaultSort(defaultSortBy, defaultSortOrder));
  const [priceBucket, setPriceBucket] = useState<PriceBucket>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch, sortOption, priceBucket, inStockOnly]);

  const sort = sortOptions.find((opt) => opt.value === sortOption) ?? sortOptions[0];
  const bucket = priceBuckets.find((b) => b.value === priceBucket);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort_by: sort.sort_by,
      sort_order: sort.sort_order,
      category: activeCategory !== "all" ? activeCategory : undefined,
      min_price: bucket?.min,
      max_price: bucket?.max,
      in_stock: inStockOnly || undefined,
    }),
    [page, debouncedSearch, sort, activeCategory, bucket, inStockOnly]
  );

  const { data, isLoading, isFetching } = useGetPublicProductsQuery(queryParams);
  const products = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const showSkeleton = isLoading || (isFetching && products.length === 0);

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 w-full rounded-xl pl-11 pr-4 text-sm border-gray-200 bg-gray-50"
            />
          </div>

          {/* Filter + sort row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                type="button"
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                  activeCategory === "all"
                    ? "bg-black text-primary-normal border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                    category.slug === activeCategory
                      ? "bg-black text-primary-normal border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveCategory(category.slug)}
                >
                  {category.name}
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
                  onChange={(e) => setSortOption(e.target.value as SortValue)}
                  className="bg-transparent outline-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                  {priceBuckets.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => setPriceBucket(b.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                        priceBucket === b.value
                          ? "bg-primary-normal text-black border-primary-normal"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Availability</span>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Checkbox checked={inStockOnly} onCheckedChange={(checked) => setInStockOnly(!!checked)} />
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
            <p className="text-sm text-gray-500">{pagination?.total_items ?? 0} products</p>
            <Badge className="hidden sm:inline-flex bg-gray-100 text-gray-600">21+ Age Verified</Badge>
          </div>

          {/* Product grid */}
          {showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full rounded-3xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    type="button"
                    disabled={!pagination.has_previous}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Icon icon="solar:alt-arrow-left-linear" className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    type="button"
                    disabled={!pagination.has_next}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <Icon icon="solar:alt-arrow-right-linear" className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
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

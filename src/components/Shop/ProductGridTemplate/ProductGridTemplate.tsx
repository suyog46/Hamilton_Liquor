"use client";

import { Icon } from "@iconify/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetPublicProductsQuery } from "@/redux/features/product/productApiSlice";
import { useGetPublicBrandsQuery } from "@/redux/features/brand/brandApiSlice";
import { useGetPublicCountriesQuery } from "@/redux/features/country/countryApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShopFilters from "@/components/Shop/ShopFilters/ShopFilters";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

interface ProductGridTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  initialCategory?: string;
  defaultSortBy?: "created_at" | "name" | "price";
  defaultSortOrder?: "asc" | "desc";
}

const DEFAULT_PAGE_SIZE = 12;

type SortBy = "name" | "price" | "created_at";
type SortOrder = "asc" | "desc";

const ProductGridTemplate = ({
  eyebrow,
  title,
  subtitle,
  searchPlaceholder = "Search products…",
  initialCategory,
  defaultSortBy,
  defaultSortOrder,
}: ProductGridTemplateProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: categoryData } = useGetPublicCategoriesQuery({ limit: 50 });
  const categories = useMemo(
    () => (categoryData?.data.items ?? []).filter((category) => category.is_active),
    [categoryData],
  );
  const { data: brandData } = useGetPublicBrandsQuery({ limit: 100, sort_by: "name", sort_order: "asc" });
  const brands = useMemo(
    () => (brandData?.data.items ?? []).filter((brand) => brand.is_active),
    [brandData],
  );
  const { data: countryData } = useGetPublicCountriesQuery({ limit: 100, sort_by: "name", sort_order: "asc" });
  const countries = useMemo(
    () => (countryData?.data.items ?? []).filter((country) => country.is_active),
    [countryData],
  );

  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [brandId, setBrandId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(defaultSortBy ?? "created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder ?? "desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [volumes, setVolumes] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [limitInput, setLimitInput] = useState(String(DEFAULT_PAGE_SIZE));
  const [debouncedLimitInput] = useDebounce(limitInput, 400);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const parsed = Number(debouncedLimitInput);
    if (Number.isFinite(parsed) && parsed > 0) {
      const nextLimit = Math.max(1, Math.floor(parsed));
      if (nextLimit !== limit) {
        setLimit(nextLimit);
        setPage(1);
      }
    }
  }, [debouncedLimitInput, limit]);

  const handleLimitBlur = () => {
    const parsed = Number(limitInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLimitInput(String(limit));
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryIds.length > 0) count += 1;
    if (brandId) count += 1;
    if (countryId) count += 1;
    if (minPrice !== "" || maxPrice !== "") count += 1;
    if (volumes.length > 0) count += volumes.length;
    if (inStockOnly) count += 1;
    return count;
  }, [categoryIds, brandId, countryId, minPrice, maxPrice, volumes, inStockOnly]);

  useEffect(() => {
    const currentCategory = categoryIds[0];

    if (
      !initialCategory ||
      categoryIds.length !== 1 ||
      currentCategory !== initialCategory ||
      categories.length === 0
    ) return;
    const category = categories.find((item) => item.id === initialCategory || item.slug === initialCategory);
    if (category) {
      const childCategoryIds = categories
        .filter((item) => item.parent?.id === category.id)
        .map((item) => item.id);
      const nextCategoryIds = [category.id, ...childCategoryIds];
      const categoryIdsChanged =
        categoryIds.length !== nextCategoryIds.length ||
        categoryIds.some((id, index) => id !== nextCategoryIds[index]);

      if (categoryIdsChanged) {
        setCategoryIds(nextCategoryIds);
      }
    }
  }, [initialCategory, categoryIds, categories]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [categoryIds, brandId, countryId, debouncedSearch, sortBy, sortOrder, minPrice, maxPrice, volumes, inStockOnly]);

  const selectedCategorySlugs = useMemo(
    () =>
      categoryIds
        .map((categoryId) => categories.find((category) => category.id === categoryId)?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    [categoryIds, categories],
  );

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      category: selectedCategorySlugs.length > 0 ? selectedCategorySlugs : undefined,
      brand: brandId || undefined,
      country: countryId || undefined,
      min_price: minPrice === "" ? undefined : Number(minPrice),
      max_price: maxPrice === "" ? undefined : Number(maxPrice),
      volume_ml: volumes.length > 0 ? volumes : undefined,
      in_stock: inStockOnly || undefined,
    }),
    [page, limit, debouncedSearch, sortBy, sortOrder, selectedCategorySlugs, brandId, countryId, minPrice, maxPrice, volumes, inStockOnly]
  );

  const { data, isLoading, isFetching } = useGetPublicProductsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const products = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const showSkeleton = isLoading || (isFetching && products.length === 0);

  const handleCategoryChange = (nextCategoryIds: string[]) => {
    setCategoryIds(nextCategoryIds);

    const nextParams = new URLSearchParams(searchParams.toString());
    const selectedCategory = categories.find(
      (category) => category.id === nextCategoryIds[0],
    );

    if (nextCategoryIds.length === 1 && selectedCategory) {
      nextParams.set("category", selectedCategory.slug);
    } else {
      nextParams.delete("category");
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const clearFilters = () => {
    handleCategoryChange([]);
    setBrandId("");
    setCountryId("");
    setMinPrice("");
    setMaxPrice("");
    setVolumes([]);
    setInStockOnly(false);
  };

  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} subtitle={subtitle} breadcrumbs={[{ name: title }]} />

      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Sticky single div: Search + Filter (mobile) + Sort by + Order */}
          <div className="sticky top-16 md:top-28 z-20 mb-6 bg-white/95 backdrop-blur-md py-3 border-b border-gray-100 shadow-xs transition-all">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search bar */}
              <div className="relative flex-1 min-w-0">
                <Icon
                  icon="solar:magnifer-linear"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400"
                />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-11 w-full rounded-xl pl-10 pr-9 text-sm border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-4" />
                  </button>
                )}
              </div>

              {/* Controls: Filter trigger (mobile only < md) + Sort by + Order */}
              <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:items-center shrink-0">
                {/* Mobile Filter Button: shown beside sort by on small devices up to md */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-2xs hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:tuning-4-linear" className="size-4 text-primary-normal" />
                    <span>Filters</span>
                  </div>
                  {activeFilterCount > 0 ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary-normal text-[10px] font-bold text-black">
                      {activeFilterCount}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-normal">Tap to filter</span>
                  )}
                </button>

                {/* Sort by */}
                <label className="flex w-full md:w-auto items-center justify-between md:justify-start gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 md:py-2 text-xs font-medium text-gray-700 shadow-2xs hover:border-gray-300 transition">
                  <span className="text-gray-400">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortBy)}
                    className="bg-transparent outline-none cursor-pointer font-semibold text-gray-800 text-right md:text-left"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="created_at">Created at</option>
                  </select>
                </label>

                {/* Order */}
                <label className="flex w-full md:w-auto items-center justify-between md:justify-start gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 md:py-2 text-xs font-medium text-gray-700 shadow-2xs hover:border-gray-300 transition">
                  <span className="text-gray-400">Order</span>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                    className="bg-transparent outline-none cursor-pointer font-semibold text-gray-800 text-right md:text-left"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-7 md:grid-cols-[240px_minmax(0,1fr)]">
            {/* Desktop Sidebar: hidden on small devices up to md */}
            <div className="hidden md:block">
              <ShopFilters
                categories={categories}
                brands={brands}
                countries={countries}
                categoryIds={categoryIds}
                brandId={brandId}
                countryId={countryId}
                minPrice={minPrice}
                maxPrice={maxPrice}
                volumes={volumes}
                inStockOnly={inStockOnly}
                onCategoryChange={handleCategoryChange}
                onBrandChange={setBrandId}
                onCountryChange={setCountryId}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onVolumeChange={(volume, checked) =>
                  setVolumes((current) =>
                    checked ? [...current, volume] : current.filter((item) => item !== volume),
                  )
                }
                onInStockChange={setInStockOnly}
                onClear={clearFilters}
              />
            </div>

            <div className="min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">{pagination?.total_items ?? 0} products</p>
                <Badge className="hidden bg-gray-100 text-gray-600 sm:inline-flex">21+ Age Verified</Badge>
              </div>

              {showSkeleton ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                  {Array.from({ length: limit }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-3xl" />)}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                  </div>
                  {pagination && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                      <button
                        type="button"
                        disabled={!pagination.has_previous}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <Icon icon="solar:alt-arrow-left-linear" className="w-3.5 h-3.5" /> Prev
                      </button>

                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>
                          Page <strong className="font-semibold text-gray-900">{pagination.page}</strong> of{" "}
                          <strong className="font-semibold text-gray-900">{pagination.total_pages}</strong>
                        </span>

                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                          <span className="text-gray-400">Show</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={limitInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setLimitInput(val);
                            }}
                            onBlur={handleLimitBlur}
                            className="h-8 w-14 rounded-md border border-gray-200 bg-white px-2 text-center text-xs font-semibold text-gray-800 outline-none transition hover:border-gray-300 focus:border-primary-normal focus:ring-1 focus:ring-primary-normal"
                            aria-label="Products per page"
                          />
                          <span className="text-gray-400">per page</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!pagination.has_next}
                        onClick={() => setPage((p) => p + 1)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
                      >
                        Next <Icon icon="solar:alt-arrow-right-linear" className="w-3.5 h-3.5" />
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
          </div>
        </div>
      </section>

      {/* Mobile Filter Dialog for small devices up to md */}
      <Dialog open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white gap-0 border border-gray-200 shadow-2xl"
        >
          {/* Header with Title and Clear button */}
          <DialogHeader className="border-b border-gray-100 px-5 py-4 shrink-0 pr-12 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:tuning-4-linear" className="size-5 text-primary-normal" />
              <DialogTitle className="font-title text-base font-bold text-gray-900">
                Filters
              </DialogTitle>
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-normal text-xs font-bold text-black">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <DialogDescription className="sr-only">
              Filter products by category, brand, country, price, volume, and stock.
            </DialogDescription>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary-normal hover:opacity-80 transition cursor-pointer"
              >
                Clear all
              </button>
            )}
          </DialogHeader>

          {/* Scrollable Filters Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ShopFilters
              isMobileDialog
              categories={categories}
              brands={brands}
              countries={countries}
              categoryIds={categoryIds}
              brandId={brandId}
              countryId={countryId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              volumes={volumes}
              inStockOnly={inStockOnly}
              onCategoryChange={handleCategoryChange}
              onBrandChange={setBrandId}
              onCountryChange={setCountryId}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onVolumeChange={(volume, checked) =>
                setVolumes((current) =>
                  checked
                    ? [...current, volume]
                    : current.filter((item) => item !== volume),
                )
              }
              onInStockChange={setInStockOnly}
              onClear={clearFilters}
            />
          </div>

          {/* Fixed / Sticky Footer with Done Button */}
          <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white/95 backdrop-blur-sm p-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <Button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full h-11 bg-primary-normal font-semibold text-black hover:bg-primary-hover shadow-xs rounded-xl"
            >
              Done {pagination ? `(${pagination.total_items} products)` : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGridTemplate;

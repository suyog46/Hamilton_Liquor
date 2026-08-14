"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/redux/features/category/categoryApiSlice";
import type { Brand } from "@/redux/features/brand/brandApiSlice";
import type { Country } from "@/redux/features/country/countryApiSlice";
import { formatVolume } from "@/lib/utils/productDisplay";

export const SHOP_VOLUMES = [50, 187.5, 200, 222, 330, 355, 375, 473, 500, 591, 700, 750, 1000, 1500, 1750, 3000];

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
  countries: Country[];
  categoryId: string;
  brandId: string;
  countryId: string;
  minPrice: string;
  maxPrice: string;
  volumes: number[];
  inStockOnly: boolean;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onVolumeChange: (volume: number, checked: boolean) => void;
  onInStockChange: (checked: boolean) => void;
  onClear: () => void;
}

interface FilterDropdownProps {
  label: string;
  allLabel: string;
  value: string;
  options: { slug: string; name: string; imageUrl?: string }[];
  onChange: (value: string) => void;
}

const FilterDropdown = ({ label, allLabel, value, options, onChange }: FilterDropdownProps) => {
  const selectedOption = options.find((option) => option.slug === value);

  return <div className="flex flex-col gap-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    <Select value={value || "all"} onValueChange={(selected) => onChange(selected === "all" || !selected ? "" : selected)}>
      <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 bg-white px-3 text-sm font-normal text-gray-700">
        <SelectValue placeholder={allLabel}>
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedOption.imageUrl} alt="" className="h-4 w-5 shrink-0 rounded-sm object-cover" />
            )}
            <span className="truncate">{selectedOption?.name ?? allLabel}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg p-1">
        <SelectItem value="all" className="rounded-md px-3 py-2.5">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.slug} value={option.slug} className="rounded-md px-3 py-2.5">
            {option.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.imageUrl} alt="" className="h-4 w-5 shrink-0 rounded-sm object-cover" />
            )}
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>;
};

const ShopFilters = ({
  categories,
  brands,
  countries,
  categoryId,
  brandId,
  countryId,
  minPrice,
  maxPrice,
  volumes,
  inStockOnly,
  onCategoryChange,
  onBrandChange,
  onCountryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onVolumeChange,
  onInStockChange,
  onClear,
}: ShopFiltersProps) => (
  <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-5 lg:sticky lg:top-28">
    <div className="mb-5 flex items-center justify-between">
      <h2 className="font-title text-lg font-semibold text-black">Filters</h2>
      <button type="button" onClick={onClear} className="text-xs font-semibold text-primary-normal hover:opacity-80">
        Clear
      </button>
    </div>

    <div className="flex flex-col gap-5">
      <FilterDropdown
        label="Category"
        allLabel="All categories"
        value={categoryId}
        options={categories.map(({ slug, name }) => ({ slug, name }))}
        onChange={onCategoryChange}
      />
      <FilterDropdown
        label="Brand"
        allLabel="All brands"
        value={brandId}
        options={brands.map(({ slug, name }) => ({ slug, name }))}
        onChange={onBrandChange}
      />
      <FilterDropdown
        label="Country"
        allLabel="All countries"
        value={countryId}
        options={countries.map(({ slug, name, flag }) => ({ slug, name, imageUrl: flag?.url }))}
        onChange={onCountryChange}
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price</span>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" min="0" step="0.01" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} placeholder="Min" className="h-10 rounded-lg bg-white" />
          <Input type="number" min="0" step="0.01" value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} placeholder="Max" className="h-10 rounded-lg bg-white" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Volume</span>
        <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {SHOP_VOLUMES.map((volume) => (
            <label key={volume} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
              <Checkbox checked={volumes.includes(volume)} onCheckedChange={(checked) => onVolumeChange(volume, !!checked)} />
              {formatVolume(volume)}
            </label>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
        <Checkbox checked={inStockOnly} onCheckedChange={(checked) => onInStockChange(!!checked)} />
        In stock only
      </label>
    </div>
  </aside>
);

export default ShopFilters;

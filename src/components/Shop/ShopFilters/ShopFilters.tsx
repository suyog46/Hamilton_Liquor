"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
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
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
  countries: Country[];
  categoryIds: string[];
  brandId: string;
  countryId: string;
  minPrice: string;
  maxPrice: string;
  minVolume: string;
  maxVolume: string;
  minAlcohol: string;
  maxAlcohol: string;
  inStockOnly: boolean;
  isStaffPick: boolean;
  isFeatured: boolean;
  isLiquor: boolean;
  onCategoryChange: (value: string[]) => void;
  onBrandChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinVolumeChange: (value: string) => void;
  onMaxVolumeChange: (value: string) => void;
  onMinAlcoholChange: (value: string) => void;
  onMaxAlcoholChange: (value: string) => void;
  onInStockChange: (checked: boolean) => void;
  onStaffPickChange: (checked: boolean) => void;
  onFeaturedChange: (checked: boolean) => void;
  onLiquorChange: (checked: boolean) => void;
  onClear: () => void;
  isMobileDialog?: boolean;
  className?: string;
}

interface FilterDropdownProps {
  label: string;
  allLabel: string;
  value: string;
  options: { slug: string; name: string; imageUrl?: string }[];
  onChange: (value: string) => void;
}

interface CategoryGroup {
  parent: Category;
  children: Category[];
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
  categoryIds,
  brandId,
  countryId,
  minPrice,
  maxPrice,
  minVolume,
  maxVolume,
  minAlcohol,
  maxAlcohol,
  inStockOnly,
  isStaffPick,
  isFeatured,
  isLiquor,
  onCategoryChange,
  onBrandChange,
  onCountryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMinVolumeChange,
  onMaxVolumeChange,
  onMinAlcoholChange,
  onMaxAlcoholChange,
  onInStockChange,
  onStaffPickChange,
  onFeaturedChange,
  onLiquorChange,
  onClear,
  isMobileDialog = false,
  className,
}: ShopFiltersProps) => {
  const [openParentIds, setOpenParentIds] = useState<string[]>([]);

  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const parentCategories = categories.filter((category) => !category.parent?.id);

    return parentCategories.map((parent) => ({
      parent,
      children: categories.filter((category) => category.parent?.id === parent.id),
    }));
  }, [categories]);

  // console.log("categoryGroups", categoryGroups);

  const toggleParentOpen = (parentId: string) => {
    setOpenParentIds((current) =>
      current.includes(parentId)
        ? current.filter((id) => id !== parentId)
        : [...current, parentId],
    );
  };

  const toggleCategory = (categoryId: string, checked: boolean) => {
    onCategoryChange(
      checked
        ? Array.from(new Set([...categoryIds, categoryId]))
        : categoryIds.filter((item) => item !== categoryId),
    );
  };

  const toggleCategoryGroup = (group: CategoryGroup, checked: boolean) => {
    const groupIds = [group.parent.id, ...group.children.map((child) => child.id)];

    if (checked && group.children.length > 0) {
      setOpenParentIds((current) =>
        current.includes(group.parent.id) ? current : [...current, group.parent.id],
      );
    }

    // Step 3: when checkboxing the parent, checkbox the whole children list as well.
    onCategoryChange(
      checked
        ? Array.from(new Set([...categoryIds, ...groupIds]))
        : categoryIds.filter((categoryId) => !groupIds.includes(categoryId)),
    );
  };

  return (
    <aside
      className={cn(
        isMobileDialog
          ? "flex flex-col gap-5 p-0"
          : "h-fit rounded-2xl border border-gray-100 bg-gray-50 p-5 md:sticky md:top-44",
        className,
      )}
    >
      {!isMobileDialog && (
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-title text-lg font-semibold text-black">Filters</h2>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-primary-normal hover:opacity-80 transition cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</span>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {categoryGroups.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">No categories available</p>
            ) : (
              categoryGroups.map((group) => {
                const isOpen = openParentIds.includes(group.parent.id);
                const groupIds = [
                  group.parent.id,
                  ...group.children.map((child) => child.id),
                ];
                const parentChecked = groupIds.every((categoryId) =>
                  categoryIds.includes(categoryId),
                );

                return (
                  <div key={group.parent.id} className="border-b border-gray-100 last:border-b-0">
                    <div className="flex min-h-11 items-center gap-2 px-3">
                      <Checkbox
                        checked={parentChecked}
                        onCheckedChange={(checked) => toggleCategoryGroup(group, !!checked)}
                      />
                      <button
                        type="button"
                        onClick={() => toggleParentOpen(group.parent.id)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-sm font-medium text-gray-800"
                      >
                        <span className="truncate">{group.parent.name}</span>
                        {group.children.length > 0 && (
                          <Icon
                            icon="solar:alt-arrow-down-linear"
                            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>
                    </div>

                    {isOpen && group.children.length > 0 && (
                      <div className="space-y-2 bg-gray-50 px-3 pb-3 pl-9">
                        {group.children.map((child) => (
                          <label key={child.id} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                            <Checkbox
                              checked={categoryIds.includes(child.id)}
                              onCheckedChange={(checked) => toggleCategory(child.id, !!checked)}
                            />
                            <span className="truncate">{child.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

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
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Volume (ml)</span>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              value={minVolume}
              onChange={(event) => onMinVolumeChange(event.target.value)}
              placeholder="Min ml"
              className="h-10 rounded-lg bg-white"
            />
            <Input
              type="number"
              min="0"
              step="1"
              value={maxVolume}
              onChange={(event) => onMaxVolumeChange(event.target.value)}
              placeholder="Max ml"
              className="h-10 rounded-lg bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              { label: "≤ 375ml", min: "", max: "375" },
              { label: "750ml", min: "750", max: "750" },
              { label: "1000ml (1L)", min: "1000", max: "1000" },
              { label: "≥ 1750ml", min: "1750", max: "" },
            ].map((preset) => {
              const isActive = minVolume === preset.min && maxVolume === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      onMinVolumeChange("");
                      onMaxVolumeChange("");
                    } else {
                      onMinVolumeChange(preset.min);
                      onMaxVolumeChange(preset.max);
                    }
                  }}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-medium transition cursor-pointer",
                    isActive
                      ? "border-primary-normal bg-primary-normal/10 text-primary-active font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Alcohol (% ABV)</span>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={minAlcohol}
              onChange={(event) => onMinAlcoholChange(event.target.value)}
              placeholder="Min %"
              className="h-10 rounded-lg bg-white"
            />
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={maxAlcohol}
              onChange={(event) => onMaxAlcoholChange(event.target.value)}
              placeholder="Max %"
              className="h-10 rounded-lg bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              { label: "≤ 0.5% (Non-Alc)", min: "0", max: "0.5" },
              { label: "< 15% (Beer/Wine)", min: "0", max: "15" },
              { label: "15% - 40%", min: "15", max: "40" },
              { label: "≥ 40% (Spirits)", min: "40", max: "" },
            ].map((preset) => {
              const isActive = minAlcohol === preset.min && maxAlcohol === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      onMinAlcoholChange("");
                      onMaxAlcoholChange("");
                    } else {
                      onMinAlcoholChange(preset.min);
                      onMaxAlcoholChange(preset.max);
                    }
                  }}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-medium transition cursor-pointer",
                    isActive
                      ? "border-primary-normal bg-primary-normal/10 text-primary-active font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product Highlights</span>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <Checkbox checked={inStockOnly} onCheckedChange={(checked) => onInStockChange(!!checked)} />
            In stock only
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <Checkbox checked={isStaffPick} onCheckedChange={(checked) => onStaffPickChange(!!checked)} />
            Staff picks
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <Checkbox checked={isFeatured} onCheckedChange={(checked) => onFeaturedChange(!!checked)} />
            Featured products
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <Checkbox checked={isLiquor} onCheckedChange={(checked) => onLiquorChange(!!checked)} />
            Liquor only
          </label>
        </div>
      </div>
    </aside>
  );
};

export default ShopFilters;

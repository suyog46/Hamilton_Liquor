"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaUpload, { type MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApiSlice";
import { useGetCountriesQuery } from "@/redux/features/country/countryApiSlice";
import { useCreateProductMutation } from "@/redux/features/product/productApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

let localIdCounter = 0;
const nextLocalId = () => `variant-${++localIdCounter}`;

interface VariantDraft {
  localId: string;
  volume_ml: string;
  price: string;
  alcohol_percentage: string;
  quantity: string;
  media: MediaValue | null;
}

const emptyVariant = (): VariantDraft => ({
  localId: nextLocalId(),
  volume_ml: "",
  price: "",
  alcohol_percentage: "",
  quantity: "",
  media: null,
});

const NewProductPage = () => {
  const router = useRouter();

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: countriesData } = useGetCountriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const categories = categoriesData?.data.items ?? [];
  const brands = brandsData?.data.items ?? [];
  const countries = countriesData?.data.items ?? [];

  const categoryItems = categories.map((c) => ({ value: c.id, label: c.name }));
  const brandItems = brands.map((b) => ({ value: b.id, label: b.name }));
  const countryItems = countries.map((c) => ({ value: c.id, label: c.name }));

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [brandId, setBrandId] = useState<string | undefined>(undefined);
  const [countryId, setCountryId] = useState<string | undefined>(undefined);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateVariant = (localId: string, patch: Partial<VariantDraft>) => {
    setVariants((prev) => prev.map((v) => (v.localId === localId ? { ...v, ...patch } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (localId: string) =>
    setVariants((prev) => prev.filter((v) => v.localId !== localId));

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = "Product name is required.";
    if (!categoryId) nextErrors.category = "Category is required.";
    if (!brandId) nextErrors.brand = "Brand is required.";

    variants.forEach((v, i) => {
      const volume = Number(v.volume_ml);
      const price = Number(v.price);
      const alcohol = Number(v.alcohol_percentage);
      const quantity = Number(v.quantity);

      if (!v.volume_ml || !(volume > 0)) nextErrors[`variant-${i}-volume`] = "Enter a volume greater than 0.";
      if (!v.price || !(price > 0)) nextErrors[`variant-${i}-price`] = "Enter a price greater than 0.";
      if (v.alcohol_percentage === "" || alcohol < 0 || alcohol > 100)
        nextErrors[`variant-${i}-alcohol`] = "Enter a value between 0 and 100.";
      if (v.quantity === "" || quantity < 0) nextErrors[`variant-${i}-quantity`] = "Enter a valid quantity.";
      if (!v.media) nextErrors[`variant-${i}-media`] = "Upload an image for this variant.";
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      const res = await createProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        category_id: categoryId!,
        brand_id: brandId!,
        country_id: countryId || undefined,
        variants: variants.map((v) => ({
          volume_ml: Number(v.volume_ml),
          price: Number(v.price),
          alcohol_percentage: Number(v.alcohol_percentage),
          quantity: Number(v.quantity),
          media_id: v.media!.id,
        })),
      }).unwrap();

      toast.success("Product created successfully.");
      router.push(`/admin/products/${res.data.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create product."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AdminPageHeader
        title="Add Product"
        description="Create a new product along with its initial variants."
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="rounded-lg" render={<Link href="/admin/products" />}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover cursor-pointer rounded-lg"
              disabled={isCreating}
            >
              {isCreating && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
              Create Product
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="product-name">Product name</FieldLabel>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jack Daniel's Old No. 7"
                className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="product-description">Description</FieldLabel>
              <Textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this product"
                rows={3}
                className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field data-invalid={!!errors.category}>
                <FieldLabel>Category</FieldLabel>
                <Select
                  items={categoryItems}
                  value={categoryId}
                  onValueChange={(value) => setCategoryId(value ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <FieldError>{errors.category}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.brand}>
                <FieldLabel>Brand</FieldLabel>
                <Select
                  items={brandItems}
                  value={brandId}
                  onValueChange={(value) => setBrandId(value ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brand && <FieldError>{errors.brand}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Country</FieldLabel>
                <Select
                  items={countryItems}
                  value={countryId}
                  onValueChange={(value) => setCountryId(value ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button type="button" variant="secondary" size="sm" className="gap-1.5 rounded-lg" onClick={addVariant}>
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {variants.map((variant, i) => (
            <div key={variant.localId} className="border border-input p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium">Variant {i + 1}</p>
                {variants.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove variant"
                    onClick={() => removeVariant(variant.localId)}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field data-invalid={!!errors[`variant-${i}-volume`]}>
                  <FieldLabel>Volume (mL)</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={variant.volume_ml}
                    onChange={(e) => updateVariant(variant.localId, { volume_ml: e.target.value })}
                    placeholder="750"
                  />
                  {errors[`variant-${i}-volume`] && (
                    <FieldError>{errors[`variant-${i}-volume`]}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors[`variant-${i}-price`]}>
                  <FieldLabel>Price ($)</FieldLabel>
                  <Input
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.localId, { price: e.target.value })}
                    placeholder="29.99"
                  />
                  {errors[`variant-${i}-price`] && (
                    <FieldError>{errors[`variant-${i}-price`]}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors[`variant-${i}-alcohol`]}>
                  <FieldLabel>Alcohol %</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={variant.alcohol_percentage}
                    onChange={(e) =>
                      updateVariant(variant.localId, { alcohol_percentage: e.target.value })
                    }
                    placeholder="40"
                  />
                  {errors[`variant-${i}-alcohol`] && (
                    <FieldError>{errors[`variant-${i}-alcohol`]}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors[`variant-${i}-quantity`]}>
                  <FieldLabel>Quantity</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    value={variant.quantity}
                    onChange={(e) => updateVariant(variant.localId, { quantity: e.target.value })}
                    placeholder="0"
                  />
                  {errors[`variant-${i}-quantity`] && (
                    <FieldError>{errors[`variant-${i}-quantity`]}</FieldError>
                  )}
                </Field>
              </div>

              <div className="mt-3">
                <FieldLabel className="mb-1.5">Image</FieldLabel>
                <MediaUpload
                  value={variant.media}
                  onChange={(media) => updateVariant(variant.localId, { media })}
                />
                {errors[`variant-${i}-media`] && (
                  <FieldError className="mt-1.5">{errors[`variant-${i}-media`]}</FieldError>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
};

export default NewProductPage;

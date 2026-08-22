"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApiSlice";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetCountriesQuery } from "@/redux/features/country/countryApiSlice";
import { useCreateProductMutation } from "@/redux/features/product/productApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return "Failed to create product.";
};

const NewProductPage = () => {
  const router = useRouter();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: countriesData } = useGetCountriesQuery();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const categories = categoriesData?.data.items ?? [];
  const brands = brandsData?.data.items ?? [];
  const countries = countriesData?.data.items ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>();
  const [brandId, setBrandId] = useState<string>();
  const [countryId, setCountryId] = useState<string>();
  const [isStaffPick, setIsStaffPick] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Product name is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    if (!categoryId) nextErrors.category = "Category is required.";
    if (!brandId) nextErrors.brand = "Brand is required.";
    if (!countryId) nextErrors.country = "Country is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return toast.error("Please fix the highlighted fields.");

    try {
      const response = await createProduct({
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId!,
        brand_id: brandId!,
        country_id: countryId!,
        is_staff_pick: isStaffPick,
        is_featured: isFeatured,
      }).unwrap();
      toast.success("Product created successfully.");
      setCreatedProductId(response.data.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AdminPageHeader
        title="Add Product"
        description="Create the product details first. Variants can be added from the Variants page."
        action={<div className="flex gap-2"><Button type="button" variant="ghost" render={<Link href="/admin/products" />}>Cancel</Button><Button type="submit" disabled={isLoading} className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover">{isLoading && <Icon icon="svg-spinners:180-ring" className="size-4" />}Create Product</Button></div>}
      />
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}><FieldLabel htmlFor="product-name">Product name</FieldLabel><Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jack Daniel's Old No. 7" />{errors.name && <FieldError>{errors.name}</FieldError>}</Field>
            <Field data-invalid={!!errors.description}><FieldLabel htmlFor="product-description">Description</FieldLabel><Textarea id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe this product" />{errors.description && <FieldError>{errors.description}</FieldError>}</Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field data-invalid={!!errors.category}><FieldLabel>Category</FieldLabel><Select items={categories.map((item) => ({ value: item.id, label: item.name }))} value={categoryId} onValueChange={(value) => setCategoryId(value ?? undefined)}><SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>{errors.category && <FieldError>{errors.category}</FieldError>}</Field>
              <Field data-invalid={!!errors.brand}><FieldLabel>Brand</FieldLabel><Select items={brands.map((item) => ({ value: item.id, label: item.name }))} value={brandId} onValueChange={(value) => setBrandId(value ?? undefined)}><SelectTrigger className="w-full"><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent>{brands.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>{errors.brand && <FieldError>{errors.brand}</FieldError>}</Field>
              <Field data-invalid={!!errors.country}><FieldLabel>Country</FieldLabel><Select items={countries.map((item) => ({ value: item.id, label: item.name }))} value={countryId} onValueChange={(value) => setCountryId(value ?? undefined)}><SelectTrigger className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger><SelectContent>{countries.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>{errors.country && <FieldError>{errors.country}</FieldError>}</Field>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-950">How should this product be promoted?</p>
                <p className="mt-1 text-xs text-gray-600">Choose where this product should receive extra visibility. You can select both.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label htmlFor="product-staff-pick" className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${isStaffPick ? "border-primary-normal bg-white ring-1 ring-primary-normal" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <Checkbox id="product-staff-pick" checked={isStaffPick} onCheckedChange={(checked) => setIsStaffPick(checked === true)} />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-950"><Icon icon="solar:stars-line-duotone" className="size-5 text-primary-normal" />Staff pick</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-600">Highlight this as a recommendation chosen by your team.</span>
                  </span>
                </label>
                <label htmlFor="product-featured" className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${isFeatured ? "border-primary-normal bg-white ring-1 ring-primary-normal" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <Checkbox id="product-featured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked === true)} />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-950"><Icon icon="solar:cup-star-line-duotone" className="size-5 text-primary-normal" />Featured product</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-600">Show this product in the featured collection on the storefront.</span>
                  </span>
                </label>
              </div>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Dialog open={!!createdProductId} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add variants now?</DialogTitle>
            <DialogDescription>
              Your product was created. Do you want to add its variants (sizes, pricing, images) right now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              render={<Link href={`/admin/products/${createdProductId}`} />}
            >
              Skip
            </Button>
            <Button
              type="button"
              className="bg-primary-normal text-black hover:bg-primary-hover"
              render={<Link href={`/admin/variants/new/${createdProductId}`} />}
            >
              Yes, add variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default NewProductPage;

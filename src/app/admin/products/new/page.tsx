"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      }).unwrap();
      toast.success("Product created successfully.");
      router.push(`/admin/products/${response.data.id}`);
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
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
};

export default NewProductPage;

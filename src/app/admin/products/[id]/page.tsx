"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import VariantCardGrid from "@/components/Admin/VariantCardGrid/VariantCardGrid";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApiSlice";
import { useGetCountriesQuery } from "@/redux/features/country/countryApiSlice";
import {
  useDeleteProductMutation,
  useGetProductDetailQuery,
  useUpdateProductMutation,
} from "@/redux/features/product/productApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const ProductDetailPage = () => {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();

  const { data, isLoading, isError } = useGetProductDetailQuery(productId);
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: countriesData } = useGetCountriesQuery();

  const [updateProduct, { isLoading: isSavingProduct }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] = useDeleteProductMutation();

  const product = data?.data;
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
  const [countryId, setCountryId] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(true);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description ?? "");
    setCategoryId(product.category.id);
    setBrandId(product.brand.id);
    setCountryId(product.country?.id);
    setIsActive(product.is_active);
  }, [product]);

  const [deleteProductConfirmOpen, setDeleteProductConfirmOpen] = useState(false);

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Product name is required.";
    if (!categoryId) nextErrors.category = "Category is required.";
    if (!brandId) nextErrors.brand = "Brand is required.";
    if (!countryId) nextErrors.country = "Country is required.";
    setProductErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateProduct({
        product_id: productId,
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId!,
        brand_id: brandId!,
        country_id: countryId!,
        is_active: isActive,
      }).unwrap();
      toast.success("Product updated successfully.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update product."));
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;

    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted.");
      router.push("/admin/products");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete product."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">Failed to load this product.</p>
          <Button variant="secondary" size="sm" render={<Link href="/admin/products" />}>
            Back to Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title={product.name}
        description={`/${product.slug}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" render={<Link href="/admin/products" />}>
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-1.5"
              disabled={isDeletingProduct}
              onClick={() => setDeleteProductConfirmOpen(true)}
            >
              {isDeletingProduct ? (
                <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />
              ) : (
                <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4" />
              )}
              Delete Product
            </Button>
          </div>
        }
      />

      <form onSubmit={handleProductSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!productErrors.name}>
                <FieldLabel htmlFor="product-name">Product name</FieldLabel>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
                {productErrors.name && <FieldError>{productErrors.name}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="product-description">Description</FieldLabel>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field data-invalid={!!productErrors.category}>
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
                  {productErrors.category && <FieldError>{productErrors.category}</FieldError>}
                </Field>

                <Field data-invalid={!!productErrors.brand}>
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
                  {productErrors.brand && <FieldError>{productErrors.brand}</FieldError>}
                </Field>

                <Field data-invalid={!!productErrors.country}>
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    items={countryItems}
                    value={countryId}
                    onValueChange={(value) => setCountryId(value ?? undefined)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {productErrors.country && <FieldError>{productErrors.country}</FieldError>}
                </Field>
              </div>

              <Field orientation="horizontal">
                <Checkbox
                  id="product-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <FieldLabel htmlFor="product-active" className="font-normal">
                  Active (visible in storefront)
                </FieldLabel>
              </Field>
            </FieldGroup>

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
                disabled={isSavingProduct}
              >
                {isSavingProduct && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5 bg-primary-normal hover:bg-primary-hover transition-all duration-150"
            render={<Link href={`/admin/variants/new/${productId}`} />}
          >
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent>
          <VariantCardGrid productId={productId} variants={product.variants} compact />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteProductConfirmOpen}
        onOpenChange={setDeleteProductConfirmOpen}
        title={`Delete "${product.name}"?`}
        description="This cannot be undone."
        isLoading={isDeletingProduct}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
};

export default ProductDetailPage;

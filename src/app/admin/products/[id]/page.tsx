"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaUpload, { type MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";
import { AdjustInventoryDialog } from "@/components/Admin/AdjustInventoryDialog/AdjustInventoryDialog";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApiSlice";
import { useGetCountriesQuery } from "@/redux/features/country/countryApiSlice";
import {
  useDeleteProductMutation,
  useGetProductDetailQuery,
  useUpdateProductMutation,
  type ProductVariant,
} from "@/redux/features/product/productApiSlice";
import {
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
} from "@/redux/features/product/productVariantApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

interface VariantFormState {
  volume_ml: string;
  price: string;
  alcohol_percentage: string;
  quantity: string;
  is_active: boolean;
  media: MediaValue | null;
}

const emptyVariantForm = (): VariantFormState => ({
  volume_ml: "",
  price: "",
  alcohol_percentage: "",
  quantity: "",
  is_active: true,
  media: null,
});

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
  const [createVariant, { isLoading: isCreatingVariant }] = useCreateProductVariantMutation();
  const [updateVariant, { isLoading: isUpdatingVariant }] = useUpdateProductVariantMutation();
  const [deleteVariant, { isLoading: isDeletingVariant }] = useDeleteProductVariantMutation();

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

  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState<VariantFormState>(emptyVariantForm());
  const [variantErrors, setVariantErrors] = useState<Record<string, string>>({});
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);
  const [deleteProductConfirmOpen, setDeleteProductConfirmOpen] = useState(false);
  const [variantPendingDelete, setVariantPendingDelete] = useState<ProductVariant | null>(null);

  const openCreateVariantDialog = () => {
    setEditingVariant(null);
    setVariantForm(emptyVariantForm());
    setVariantErrors({});
    setVariantDialogOpen(true);
  };

  const openEditVariantDialog = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantForm({
      volume_ml: String(variant.volume_ml),
      price: variant.price,
      alcohol_percentage: variant.alcohol_percentage,
      quantity: String(variant.quantity),
      is_active: variant.is_active,
      media: variant.media,
    });
    setVariantErrors({});
    setVariantDialogOpen(true);
  };

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

  const handleVariantSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const volume = Number(variantForm.volume_ml);
    const price = Number(variantForm.price);
    const alcohol = Number(variantForm.alcohol_percentage);
    const quantity = Number(variantForm.quantity);

    const nextErrors: Record<string, string> = {};
    if (!variantForm.volume_ml || !(volume > 0)) nextErrors.volume = "Enter a volume greater than 0.";
    if (!variantForm.price || !(price > 0)) nextErrors.price = "Enter a price greater than 0.";
    if (variantForm.alcohol_percentage === "" || alcohol < 0 || alcohol > 100)
      nextErrors.alcohol = "Enter a value between 0 and 100.";
    if (variantForm.quantity === "" || quantity < 0) nextErrors.quantity = "Enter a valid quantity.";
    if (!variantForm.media) nextErrors.media = "Upload an image for this variant.";
    setVariantErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      if (editingVariant) {
        await updateVariant({
          variant_id: editingVariant.id,
          product_id: productId,
          volume_ml: volume,
          price,
          alcohol_percentage: alcohol,
          quantity,
          is_active: variantForm.is_active,
          media_id: variantForm.media!.id,
        }).unwrap();
        toast.success("Variant updated successfully.");
      } else {
        await createVariant({
          product_id: productId,
          volume_ml: volume,
          price,
          alcohol_percentage: alcohol,
          quantity,
          media: [{ media_id: variantForm.media!.id, display_order: 1 }],
        }).unwrap();
        toast.success("Variant created successfully.");
      }
      setVariantDialogOpen(false);
    } catch (err) {
      toast.error(
        getErrorMessage(err, editingVariant ? "Failed to update variant." : "Failed to create variant.")
      );
    }
  };

  const handleDeleteVariant = async () => {
    if (!variantPendingDelete) return;
    const variant = variantPendingDelete;

    setDeletingVariantId(variant.id);
    try {
      await deleteVariant({ variant_id: variant.id, product_id: productId }).unwrap();
      toast.success("Variant deleted.");
      setVariantPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete variant."));
    } finally {
      setDeletingVariantId(null);
    }
  };

  const isSavingVariant = isCreatingVariant || isUpdatingVariant;

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
          <Button type="button" variant="secondary" size="sm" className="gap-1.5 bg-primary-normal hover:bg-primary-hover transition-all duration-150" onClick={openCreateVariantDialog}>
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent>
          {product.variants.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No variants yet. Add one to start selling this product.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.variants.map((variant) => (
                <div key={variant.id} className="flex flex-col gap-3 border border-input p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden bg-muted">
                      {variant.media?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={variant.media.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{variant.volume_ml} mL</p>
                        <Badge variant={variant.is_active ? "success" : "outline"}>
                          {variant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        ${Number(variant.price).toFixed(2)} · {Number(variant.alcohol_percentage)}% ABV · Qty{" "}
                        {variant.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Edit variant"
                        onClick={() => openEditVariantDialog(variant)}
                        className="cursor-pointer text-muted-foreground transition-colors hover:text-primary-normal"
                      >
                        <Icon icon="solar:pen-linear" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete variant"
                        disabled={isDeletingVariant && deletingVariantId === variant.id}
                        onClick={() => setVariantPendingDelete(variant)}
                        className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeletingVariant && deletingVariantId === variant.id ? (
                          <Icon icon="svg-spinners:180-ring" className="h-4 w-4 text-destructive" />
                        ) : (
                          <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-input pt-2.5">
                    <AdjustInventoryDialog
                      productId={productId}
                      variantId={variant.id}
                      variantLabel={`${variant.volume_ml} mL`}
                      currentQuantity={variant.quantity}
                      trigger="button"
                      className="h-7 px-2 text-[11px]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 gap-1.5 rounded-md px-2 text-[11px]"
                      render={
                        <Link href={`/admin/products/${productId}/variants/${variant.id}/history`} />
                      }
                    >
                      <Icon icon="solar:clock-circle-linear" className="h-3.5 w-3.5" />
                      See variant history
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <form onSubmit={handleVariantSubmit}>
            <DialogHeader>
              <DialogTitle>{editingVariant ? "Edit Variant" : "Add Variant"}</DialogTitle>
              <DialogDescription>
                {editingVariant
                  ? "Update this variant's details."
                  : "Add a new size/variant for this product."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!variantErrors.volume}>
                  <FieldLabel>Volume (mL)</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={variantForm.volume_ml}
                    onChange={(e) => setVariantForm((f) => ({ ...f, volume_ml: e.target.value }))}
                    placeholder="750"
                  />
                  {variantErrors.volume && <FieldError>{variantErrors.volume}</FieldError>}
                </Field>

                <Field data-invalid={!!variantErrors.price}>
                  <FieldLabel>Price ($)</FieldLabel>
                  <Input
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="29.99"
                  />
                  {variantErrors.price && <FieldError>{variantErrors.price}</FieldError>}
                </Field>

                <Field data-invalid={!!variantErrors.alcohol}>
                  <FieldLabel>Alcohol %</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={variantForm.alcohol_percentage}
                    onChange={(e) =>
                      setVariantForm((f) => ({ ...f, alcohol_percentage: e.target.value }))
                    }
                    placeholder="40"
                  />
                  {variantErrors.alcohol && <FieldError>{variantErrors.alcohol}</FieldError>}
                </Field>

                <Field data-invalid={!!variantErrors.quantity}>
                  <FieldLabel>Quantity</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    value={variantForm.quantity}
                    onChange={(e) => setVariantForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder="0"
                  />
                  {variantErrors.quantity && <FieldError>{variantErrors.quantity}</FieldError>}
                </Field>
              </div>

              <Field>
                <FieldLabel>Image</FieldLabel>
                <MediaUpload
                  value={variantForm.media}
                  onChange={(media) => setVariantForm((f) => ({ ...f, media }))}
                />
                {variantErrors.media && <FieldError>{variantErrors.media}</FieldError>}
              </Field>

              {editingVariant && (
                <Field orientation="horizontal">
                  <Checkbox
                    id="variant-active"
                    checked={variantForm.is_active}
                    onCheckedChange={(checked) =>
                      setVariantForm((f) => ({ ...f, is_active: checked === true }))
                    }
                  />
                  <FieldLabel htmlFor="variant-active" className="font-normal">
                    Active
                  </FieldLabel>
                </Field>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setVariantDialogOpen(false)}
                disabled={isSavingVariant}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
                disabled={isSavingVariant}
              >
                {isSavingVariant && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                {editingVariant ? "Save Changes" : "Create Variant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteProductConfirmOpen}
        onOpenChange={setDeleteProductConfirmOpen}
        title={`Delete "${product.name}"?`}
        description="This cannot be undone."
        isLoading={isDeletingProduct}
        onConfirm={handleDeleteProduct}
      />

      <ConfirmDialog
        open={!!variantPendingDelete}
        onOpenChange={(open) => !open && setVariantPendingDelete(null)}
        title="Delete this variant?"
        description="This cannot be undone."
        isLoading={isDeletingVariant}
        onConfirm={handleDeleteVariant}
      />
    </div>
  );
};

export default ProductDetailPage;

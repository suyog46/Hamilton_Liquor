"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { AdjustInventoryDialog } from "@/components/Admin/AdjustInventoryDialog/AdjustInventoryDialog";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VariantWizard, {
  type VariantWizardValues,
} from "@/components/Admin/VariantWizard/VariantWizard";
import {
  useDeleteProductVariantMutation,
  useGetProductVariantDetailQuery,
  useUpdateProductVariantMutation,
} from "@/redux/features/product/productVariantApiSlice";
import { useGetProductDetailQuery } from "@/redux/features/product/productApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { isLiquorParentCategory } from "@/lib/utils/categoryDisplay";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

// Detail and edit live on the same page — view its current values, change
// them, or delete it, all in one place.
const VariantPage = () => {
  const params = useParams<{ variantId: string }>();
  const variantId = params.variantId;
  const router = useRouter();

  const { data, isLoading, isError } =
    useGetProductVariantDetailQuery(variantId);
  const [updateVariant, { isLoading: isSaving }] =
    useUpdateProductVariantMutation();
  const [deleteVariant, { isLoading: isDeleting }] =
    useDeleteProductVariantMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const variant = data?.data;
  const variantLabel =
    variant?.display_name || (variant?.volume_ml ? `${variant.volume_ml} mL` : "Variant");

  const handleSubmit = async (values: VariantWizardValues) => {
    if (!variant) return;
    try {
      await updateVariant({
        variant_id: variantId,
        product_id: variant.product_id,
        sku: values.sku.trim(),
        display_name: values.display_name.trim(),
        is_liquor: values.is_liquor,
        ...(values.is_liquor
          ? {
              volume_ml: Number(values.volume_ml),
              alcohol_percentage: Number(values.alcohol_percentage),
            }
          : {}),
        price: Number(values.price),
        is_active: values.is_active,
        media: values.media.map((media, index) => ({
          media_id: media.id,
          display_order: index + 1,
        })),
      }).unwrap();
      toast.success("Variant updated successfully.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update variant."));
    }
  };

  const handleDelete = async () => {
    if (!variant) return;
    try {
      await deleteVariant({
        variant_id: variantId,
        product_id: variant.product_id,
      }).unwrap();
      toast.success("Variant deleted.");
      router.push("/admin/variants");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete variant."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !variant) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="h-6 w-6 text-destructive"
          />
          <p className="text-xs text-muted-foreground">
            Failed to load this variant.
          </p>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href="/admin/variants" />}
          >
            Back to Variants
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isLiquorVariant = variant.is_liquor ?? (variant.volume_ml > 0 || Number(variant.alcohol_percentage) > 0);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title={variantLabel}
        description={[
          variant.sku,
          `$${Number(variant.price).toFixed(2)}`,
          isLiquorVariant && variant.alcohol_percentage
            ? `${Number(variant.alcohol_percentage)}% ABV`
            : null,
        ].filter(Boolean).join(" · ")}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={variant.is_active ? "success" : "outline"}>
              {variant.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="secondary"
              render={<Link href="/admin/variants" />}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-1.5"
              disabled={isDeleting}
              onClick={() => setConfirmOpen(true)}
            >
              {isDeleting ? (
                <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />
              ) : (
                <Icon
                  icon="solar:trash-bin-minimalistic-linear"
                  className="h-4 w-4"
                />
              )}
              Delete
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-lg font-semibold">
              {variant.available_quantity}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reserved</p>
            <p className="text-lg font-semibold">{variant.reserved_quantity}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total stock</p>
            <p className="text-lg font-semibold">{variant.quantity}</p>
          </div>
        </CardContent>
      </Card>

      <VariantWizard
        key={variant.id}
        mode="update"
        initialValues={{
          sku: variant.sku ?? "",
          display_name: variant.display_name ?? "",
          is_liquor: isLiquorVariant,
          volume_ml: variant.volume_ml != null ? String(variant.volume_ml) : "",
          price: variant.price != null ? String(Number(variant.price)) : "",
          alcohol_percentage:
            variant.alcohol_percentage != null
              ? String(Number(variant.alcohol_percentage))
              : "0",
          quantity: variant.quantity != null ? String(variant.quantity) : "0",
          is_active: variant.is_active ?? true,
          media: [...(variant.media ?? [])]
            .sort((a, b) => a.display_order - b.display_order)
            .map((item) => item.media),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />

      <Card>
        <CardContent className="flex items-center gap-2">
          <AdjustInventoryDialog
            productId={variant.product_id}
            variantId={variantId}
            variantLabel={variantLabel}
            currentQuantity={variant.quantity}
            trigger="button"
          />
          <Button
            type="button"
            variant="secondary"
            className="gap-1.5"
            render={<Link href={`/admin/variants/${variantId}/history`} />}
          >
            <Icon icon="solar:clock-circle-linear" className="h-4 w-4" />
            See variant history
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this variant?"
        description="This cannot be undone."
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default VariantPage;

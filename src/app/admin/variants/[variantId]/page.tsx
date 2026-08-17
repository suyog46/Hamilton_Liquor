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
import VariantWizard, { type VariantWizardValues } from "@/components/Admin/VariantWizard/VariantWizard";
import {
  useDeleteProductVariantMutation,
  useGetProductVariantDetailQuery,
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

// Detail and edit live on the same page — view its current values, change
// them, or delete it, all in one place.
const VariantPage = () => {
  const params = useParams<{ variantId: string }>();
  const variantId = params.variantId;
  const router = useRouter();

  const { data, isLoading, isError } = useGetProductVariantDetailQuery(variantId);
  const [updateVariant, { isLoading: isSaving }] = useUpdateProductVariantMutation();
  const [deleteVariant, { isLoading: isDeleting }] = useDeleteProductVariantMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const variant = data?.data;

  const handleSubmit = async (values: VariantWizardValues) => {
    if (!variant) return;
    try {
      await updateVariant({
        variant_id: variantId,
        product_id: variant.product_id,
        volume_ml: Number(values.volume_ml),
        price: Number(values.price),
        alcohol_percentage: Number(values.alcohol_percentage),
        quantity: Number(values.quantity),
        is_active: values.is_active,
        media: values.media.map((media, index) => ({ media_id: media.id, display_order: index })),
      }).unwrap();
      toast.success("Variant updated successfully.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update variant."));
    }
  };

  const handleDelete = async () => {
    if (!variant) return;
    try {
      await deleteVariant({ variant_id: variantId, product_id: variant.product_id }).unwrap();
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
          <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">Failed to load this variant.</p>
          <Button variant="secondary" size="sm" render={<Link href="/admin/variants" />}>
            Back to Variants
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title={`${variant.volume_ml} mL Variant`}
        description={`$${Number(variant.price).toFixed(2)} · ${Number(variant.alcohol_percentage)}% ABV`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={variant.is_active ? "success" : "outline"}>
              {variant.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="secondary" render={<Link href="/admin/variants" />}>
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
                <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        }
      />

      <VariantWizard
        mode="update"
        initialValues={{
          volume_ml: String(variant.volume_ml),
          price: variant.price,
          alcohol_percentage: variant.alcohol_percentage,
          quantity: String(variant.quantity),
          is_active: variant.is_active,
          media: [...variant.media]
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
            variantLabel={`${variant.volume_ml} mL`}
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

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import VariantWizard, { type VariantWizardValues } from "@/components/Admin/VariantWizard/VariantWizard";
import { useGetProductDetailQuery } from "@/redux/features/product/productApiSlice";
import { useCreateProductVariantMutation } from "@/redux/features/product/productVariantApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const NewVariantPage = () => {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const router = useRouter();

  const { data } = useGetProductDetailQuery(productId);
  const [createVariant, { isLoading }] = useCreateProductVariantMutation();

  const handleSubmit = async (values: VariantWizardValues) => {
    try {
      await createVariant({
        product_id: productId,
        volume_ml: Number(values.volume_ml),
        price: Number(values.price),
        alcohol_percentage: Number(values.alcohol_percentage),
        quantity: Number(values.quantity),
        media: values.media.map((media, index) => ({ media_id: media.id, display_order: index+1 })),
      }).unwrap();
      toast.success("Variant created successfully.");
      router.push("/admin/variants");
    } catch (err:any) {
      console.log("err is ", err);
      toast.error(err?.data?.error?.message ??  "Failed to create variant." );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Add Variant"
        description={data?.data.name ? `For ${data.data.name}` : undefined}
        action={
          <Button variant="secondary" render={<Link href="/admin/variants" />}>
            Cancel
          </Button>
        }
      />

      <VariantWizard mode="create" onSubmit={handleSubmit} isSubmitting={isLoading} />
    </div>
  );
};

export default NewVariantPage;

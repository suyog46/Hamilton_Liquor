"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import MediaUpload, { type MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGetProductsQuery, type Product } from "@/redux/features/product/productApiSlice";
import { useCreateProductVariantMutation } from "@/redux/features/product/productVariantApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const errorMessage = (error: unknown) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return "Failed to create variant.";
};

const CreateVariant = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [volume, setVolume] = useState("");
  const [price, setPrice] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [media, setMedia] = useState<MediaValue[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createVariant, { isLoading: isCreating }] = useCreateProductVariantMutation();

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data, isFetching, isError } = useGetProductsQuery({
    page: 1,
    limit: 10,
    search: search || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const products = data?.data.items ?? [];

  const addMedia = (value: MediaValue) => setMedia((current) => [...current, value]);
  const replaceMedia = (index: number, value: MediaValue) =>
    setMedia((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = { volume: Number(volume), price: Number(price), alcohol: Number(alcohol), quantity: Number(quantity) };
    const nextErrors: Record<string, string> = {};
    if (!selectedProduct) nextErrors.product = "Choose a product first.";
    if (!volume || values.volume < 1) nextErrors.volume = "Volume must be at least 1 mL.";
    if (!price || values.price <= 0) nextErrors.price = "Price must be greater than 0.";
    if (alcohol === "" || values.alcohol < 0 || values.alcohol > 100) nextErrors.alcohol = "Alcohol must be between 0 and 100%.";
    if (quantity === "" || values.quantity < 0) nextErrors.quantity = "Quantity cannot be negative.";
    if (!media.length) nextErrors.media = "Upload at least one image.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return toast.error("Please fix the highlighted fields.");

    try {
      await createVariant({
        product_id: selectedProduct!.id,
        volume_ml: values.volume,
        price: values.price,
        alcohol_percentage: values.alcohol,
        quantity: values.quantity,
        media: media.map((item, index) => ({ media_id: item.id, display_order: index + 1 })),
      }).unwrap();
      toast.success(`Variant created for ${selectedProduct!.name}.`);
      setVolume(""); setPrice(""); setAlcohol(""); setQuantity("0"); setMedia([]); setErrors({});
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader><CardTitle>1. Choose a product</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative"><Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="pl-8" placeholder="Search products…" /></div>
          {errors.product && <FieldError>{errors.product}</FieldError>}
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {isFetching && <p className="py-4 text-center text-xs text-muted-foreground">Searching products…</p>}
            {isError && <p className="py-4 text-center text-xs text-destructive">Failed to load products.</p>}
            {!isFetching && !isError && products.map((product) => (
              <button key={product.id} type="button" onClick={() => { setSelectedProduct(product); setErrors((current) => ({ ...current, product: "" })); }} className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedProduct?.id === product.id ? "border-primary-normal bg-primary-normal/10" : "border-input hover:bg-muted/50"}`}>
                <span className="block text-sm font-medium">{product.name}</span><span className="block text-xs text-muted-foreground">{product.brand.name} · {product.category.name}</span>
              </button>
            ))}
            {!isFetching && !isError && !products.length && <p className="py-4 text-center text-xs text-muted-foreground">No products found.</p>}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={submit}>
        <Card className={!selectedProduct ? "opacity-60" : undefined}>
          <CardHeader><CardTitle>2. Create variant{selectedProduct ? ` for ${selectedProduct.name}` : ""}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <fieldset disabled={!selectedProduct || isCreating} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!errors.volume}><FieldLabel>Volume (mL)</FieldLabel><Input type="number" min={1} value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="750" />{errors.volume && <FieldError>{errors.volume}</FieldError>}</Field>
                <Field data-invalid={!!errors.price}><FieldLabel>Price ($)</FieldLabel><Input type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" />{errors.price && <FieldError>{errors.price}</FieldError>}</Field>
                <Field data-invalid={!!errors.alcohol}><FieldLabel>Alcohol %</FieldLabel><Input type="number" min={0} max={100} step="0.01" value={alcohol} onChange={(e) => setAlcohol(e.target.value)} placeholder="40" />{errors.alcohol && <FieldError>{errors.alcohol}</FieldError>}</Field>
                <Field data-invalid={!!errors.quantity}><FieldLabel>Quantity</FieldLabel><Input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />{errors.quantity && <FieldError>{errors.quantity}</FieldError>}</Field>
              </div>
              <Field data-invalid={!!errors.media}><div className="flex items-center justify-between"><FieldLabel>Media</FieldLabel><span className="text-xs text-muted-foreground">Order is saved top to bottom</span></div>
                <div className="space-y-3">{media.map((item, index) => <div key={`${item.id}-${index}`} className="relative"><MediaUpload value={item} onChange={(value) => replaceMedia(index, value)} /><Button type="button" size="sm" variant="destructive" className="absolute right-2 top-2" onClick={() => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button></div>)}<MediaUpload value={null} onChange={addMedia} /></div>
                {errors.media && <FieldError>{errors.media}</FieldError>}
              </Field>
            </fieldset>
            <div className="flex justify-end"><Button type="submit" disabled={!selectedProduct || isCreating} className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover">{isCreating && <Icon icon="svg-spinners:180-ring" className="size-4" />}Create Variant</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateVariant;

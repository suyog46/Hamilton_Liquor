"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import VariantCardGrid from "@/components/Admin/VariantCardGrid/VariantCardGrid";
import { useGetProductsQuery, type Product } from "@/redux/features/product/productApiSlice";

const CreateVariant = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader><CardTitle>1. Choose a product</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative"><Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="pl-8" placeholder="Search products…" /></div>
          {productError && <FieldError>{productError}</FieldError>}
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {isFetching && <p className="py-4 text-center text-xs text-muted-foreground">Searching products…</p>}
            {isError && <p className="py-4 text-center text-xs text-destructive">Failed to load products.</p>}
            {!isFetching && !isError && products.map((product) => (
              <button key={product.id} type="button" onClick={() => { setSelectedProduct(product); setProductError(null); }} className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${selectedProduct?.id === product.id ? "border-primary-normal bg-primary-normal/10" : "border-input hover:bg-gray-100"}`}>
                <span className="block text-sm font-medium">{product.name}</span><span className="block text-xs text-muted-foreground">{product.brand.name} · {product.category.name}</span>
              </button>
            ))}
            {!isFetching && !isError && !products.length && <p className="py-4 text-center text-xs text-muted-foreground">No products found.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className={!selectedProduct ? "opacity-60" : undefined}>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>2. Variants{selectedProduct ? ` for ${selectedProduct.name}` : ""}</CardTitle>
          {/* {selectedProduct && (
            
          )} */}
        </CardHeader>
        <CardContent>
          {selectedProduct ? (
            <>
            <div className="flex flex-col gap-4 justify-center items-center">
            <VariantCardGrid productId={selectedProduct.id} variants={selectedProduct.variants} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5 p-4 bg-primary-normal hover:bg-primary-hover rounded-lg"
              render={<Link href={`/admin/variants/new/${selectedProduct.id}`} />}
            >
              <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
              Add Variant
            </Button>
            </div>
            </>

          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Choose a product on the left to see and manage its variants.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVariant;

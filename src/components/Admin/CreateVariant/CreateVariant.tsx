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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-h-[calc(100vh-140px)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="shrink-0">
          <CardTitle>1. Choose a product</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 space-y-3 min-h-0 overflow-hidden">
          <div className="relative shrink-0">
            <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="pl-8" placeholder="Search products…" />
          </div>
          {productError && <FieldError className="shrink-0">{productError}</FieldError>}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {isFetching && <p className="py-4 text-center text-xs text-muted-foreground">Searching products…</p>}
            {isError && <p className="py-4 text-center text-xs text-destructive">Failed to load products.</p>}
            {!isFetching && !isError && products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => { setSelectedProduct(product); setProductError(null); }}
                className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${selectedProduct?.id === product.id ? "border-primary-normal bg-primary-normal/10 font-semibold" : "border-input hover:bg-gray-100"}`}
              >
                <span className="block text-sm font-medium">{product.name}</span>
                <span className="block text-xs text-muted-foreground">{product.brand.name} · {product.category.name}</span>
              </button>
            ))}
            {!isFetching && !isError && !products.length && <p className="py-4 text-center text-xs text-muted-foreground">No products found.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className={`flex flex-col h-full ${!selectedProduct ? "opacity-60" : ""}`}>
        <CardHeader className="shrink-0">
          <CardTitle className="text-base">2. Variants{selectedProduct ? ` for ${selectedProduct.name}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {selectedProduct ? (
            <div className="flex flex-col gap-4 flex-1 pb-2">
              <VariantCardGrid productId={selectedProduct.id} variants={selectedProduct.variants} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 py-3 border-dashed border-gray-300 hover:border-primary-normal hover:bg-primary-normal/10 text-foreground font-medium rounded-xl transition-all"
                render={<Link href={`/admin/variants/new/${selectedProduct.id}`} />}
              >
                <Icon icon="solar:add-circle-linear" className="h-4 w-4 text-primary-active" />
                Add new variant
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="py-8 text-center text-xs text-muted-foreground">
                Choose a product on the left to see and manage its variants.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVariant;

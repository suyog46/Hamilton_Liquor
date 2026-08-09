"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductsTable } from "@/components/Admin/ProductsTable/ProductsTable";

const AdminProductsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Products"
        description="Add, edit, and manage inventory across your catalog."
        action={
          <Button
            className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover rounded-lg"
            render={<Link href="/admin/products/new" />}
          >
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <div className="relative w-full sm:max-w-xs">
        <Icon
          icon="solar:magnifer-linear"
          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search products…"
          className="h-9 pl-8"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <ProductsTable search={search} />
    </div>
  );
};

export default AdminProductsPage;

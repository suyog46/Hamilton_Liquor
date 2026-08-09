"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { InventoryTable } from "@/components/Admin/InventoryTable/InventoryTable";
import { Input } from "@/components/ui/input";

const AdminInventoryPage = () => {
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
        title="Inventory"
        description="View stock levels and adjust inventory across your catalog."
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

      <InventoryTable search={search} />
    </div>
  );
};

export default AdminInventoryPage;

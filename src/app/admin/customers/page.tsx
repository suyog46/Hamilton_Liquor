"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { CustomersTable } from "@/components/Admin/CustomersTable/CustomersTable";

const AdminCustomersPage = () => {
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
        title="Customers"
        description="View registered customer accounts, order frequency, and lifetime spending."
      />

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon="solar:magnifer-linear"
            className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or email…"
            className="h-9 pl-8 pr-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <Icon icon="solar:close-circle-linear" className="size-4" />
            </button>
          )}
        </div>
      </div>

      <CustomersTable search={search} />
    </div>
  );
};

export default AdminCustomersPage;

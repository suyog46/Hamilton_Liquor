"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DashboardCustomers,
  DashboardProducts,
} from "@/redux/features/dashboard/dashboardApiSlice";

interface DashboardCatalogCardsProps {
  products: DashboardProducts;
  customers: DashboardCustomers;
}

export function DashboardCatalogCards({
  products,
  customers,
}: DashboardCatalogCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Products */}
      <Card className="shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Products
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <Icon icon="solar:box-bold" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {products.total.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Total catalog items
          </p>
        </CardContent>
      </Card>

      {/* Active Products */}
      <Card className="shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Active Products
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Icon icon="solar:check-circle-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {products.active.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Published & listed in store
          </p>
        </CardContent>
      </Card>

      {/* Inactive Products */}
      <Card className="shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Inactive Products
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Icon icon="solar:eye-closed-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {products.inactive.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Drafts or archived items
          </p>
        </CardContent>
      </Card>

      {/* Out-of-Stock Variants */}
      <Card
        className={`shadow-xs transition-shadow hover:shadow-sm ${
          products.out_of_stock_variants > 0 ? "border-amber-300/80 bg-amber-50/20" : ""
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Out-of-Stock Variants
          </CardTitle>
          <div
            className={`flex size-7 items-center justify-center rounded-md ${
              products.out_of_stock_variants > 0
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Icon icon="solar:danger-triangle-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {products.out_of_stock_variants.toLocaleString()}
            </p>
            {products.out_of_stock_variants > 0 && (
              <Link
                href="/admin/inventory"
                className="text-[11px] font-medium text-primary-active hover:underline"
              >
                Restock &rarr;
              </Link>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Counts variants (e.g. 750 ml bottle), not products
          </p>
        </CardContent>
      </Card>

      {/* Total Customers */}
      <Card className="shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Customers
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
            <Icon icon="solar:users-group-rounded-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {customers.total.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Registered customer accounts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

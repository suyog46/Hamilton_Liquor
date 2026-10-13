"use client";

import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDashboardMoney } from "@/lib/utils/dashboard";
import type { DashboardRevenue } from "@/redux/features/dashboard/dashboardApiSlice";

interface DashboardRevenueCardsProps {
  revenue: DashboardRevenue;
}

export function DashboardRevenueCards({ revenue }: DashboardRevenueCardsProps) {
  const netRevenueFormatted = formatDashboardMoney(
    revenue.net_revenue.amount,
    revenue.net_revenue.currency
  );

  const grossCapturedFormatted = formatDashboardMoney(
    revenue.gross_captured_amount.amount,
    revenue.gross_captured_amount.currency
  );

  const refundedFormatted = formatDashboardMoney(
    revenue.refunded_amount.amount,
    revenue.refunded_amount.currency
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Net Revenue Card */}
      <Card className="relative overflow-hidden border-primary-normal/30 bg-gradient-to-br from-card via-card to-primary-normal/5 shadow-xs">
        <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary-normal/10 blur-xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Net Revenue
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-primary-normal/15 text-primary-active">
            <Icon icon="solar:wallet-money-bold" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {netRevenueFormatted}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              {revenue.net_revenue.currency}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {revenue.net_revenue.calculation_label ||
              "Gross Captured Amount - Refunded Amount"}
          </p>
        </CardContent>
      </Card>

      {/* Gross Captured Amount Card */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Gross Captured Amount
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Icon icon="solar:card-send-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {grossCapturedFormatted}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              {revenue.gross_captured_amount.currency}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Total captured payments before refunds
          </p>
        </CardContent>
      </Card>

      {/* Refunded Amount Card */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Refunded Amount
          </CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-700">
            <Icon icon="solar:card-recive-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {refundedFormatted}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              {revenue.refunded_amount.currency}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Total completed customer refunds
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

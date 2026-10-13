"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatStoreDate } from "@/lib/utils/dashboard";
import type { DashboardSchedule } from "@/redux/features/dashboard/dashboardApiSlice";

interface DashboardScheduleCardsProps {
  schedule: DashboardSchedule;
}

export function DashboardScheduleCards({ schedule }: DashboardScheduleCardsProps) {
  const storeTodayDate = formatStoreDate();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Today's Pickups */}
      <Card className="shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Today&apos;s Pickups
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Store date ({storeTodayDate || "America/New_York"})
            </p>
          </div>
          <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <Icon icon="solar:bag-check-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {schedule.todays_pickups.toLocaleString()}
            </span>
            <Link
              href="/admin/orders"
              className="text-[11px] font-medium text-primary-active hover:underline"
            >
              View orders &rarr;
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Scheduled customer pickups for today in America/New_York
          </p>
        </CardContent>
      </Card>

      {/* Today's Deliveries */}
      <Card className="shadow-xs transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Today&apos;s Deliveries
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Store date ({storeTodayDate || "America/New_York"})
            </p>
          </div>
          <div className="flex size-7 items-center justify-center rounded-md bg-purple-50 text-purple-700">
            <Icon icon="solar:delivery-linear" className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {schedule.todays_deliveries.toLocaleString()}
            </span>
            <Link
              href="/admin/orders"
              className="text-[11px] font-medium text-primary-active hover:underline"
            >
              View orders &rarr;
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Scheduled dispatch deliveries for today in America/New_York
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

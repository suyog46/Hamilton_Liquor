"use client";

import { useMemo, useState, type ReactNode, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateTimePicker from "@/components/Admin/DateTimePicker/DateTimePicker";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type Sale,
  type SaleStatus,
  useCancelSaleMutation,
  useEndSaleMutation,
  useGetSaleDetailQuery,
  useGetVariantSalesQuery,
  useUpdateSaleMutation,
} from "@/redux/features/sale/saleApiSlice";

const DEFAULT_LIMIT = 10;
const STORE_TIMEZONE = "America/New_York";

const SALE_STATUS_OPTIONS: { value: SaleStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const statusTone: Record<SaleStatus, string> = {
  scheduled: "border-primary-normal/40 bg-primary-normal/10 text-primary-active",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expired: "border-slate-200 bg-slate-50 text-slate-500",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string; error?: { message?: string } } | undefined;
    return data?.message ?? data?.error?.message ?? fallback;
  }
  return fallback;
};

const formatMoney = (value: string | number) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : String(value);
};

const formatPercent = (value: string | number) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toFixed(2)}%` : String(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatInTimeZone(date, STORE_TIMEZONE, "MMM d, yyyy, h:mm a");
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatInTimeZone(date, STORE_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
};

const toIsoString = (value: string) => {
  if (!value) return "";
  return fromZonedTime(value, STORE_TIMEZONE).toISOString();
};

const getTodayMinDateTime = () =>
  formatInTimeZone(new Date(), STORE_TIMEZONE, "yyyy-MM-dd'T'00:00");

function SaleStatusPill({ status }: { status: SaleStatus }) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone[status]}`}>
      {status}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function SaleDetailDialog({
  saleId,
  open,
  onOpenChange,
}: {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useGetSaleDetailQuery(saleId ?? "", {
    skip: !saleId || !open,
  });
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();
  const [endSale, { isLoading: isEnding }] = useEndSaleMutation();
  const [cancelSale, { isLoading: isCancelling }] = useCancelSaleMutation();

  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const sale = data?.data;
  const isMutating = isUpdating || isEnding || isCancelling;
  const minDateTime = getTodayMinDateTime();

  const originalStart = sale ? toDateTimeLocal(sale.started_at) : "";
  const originalEnd = sale ? toDateTimeLocal(sale.ended_at) : "";

  useEffect(() => {
    if (!sale) return;
    setStartedAt(toDateTimeLocal(sale.started_at));
    setEndedAt(toDateTimeLocal(sale.ended_at));
    setDateError(null);
  }, [sale]);

  const datesChanged = startedAt !== originalStart || endedAt !== originalEnd;

  const updateDates = async () => {
    if (!sale) return;
    if (!startedAt || !endedAt) { setDateError("Start and end dates are required."); return; }
    if (startedAt < minDateTime) { setDateError("Start date cannot be before today."); return; }
    if (endedAt <= startedAt) { setDateError("End date must be after start date."); return; }
    try {
      await updateSale({
        sale_id: sale.id,
        started_at: toIsoString(startedAt),
        ended_at: toIsoString(endedAt),
      }).unwrap();
      toast.success("Sale dates updated.");
      setDateError(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update sale."));
    }
  };

  const handleStatusAction = async () => {
    if (!sale) return;
    try {
      if (sale.is_active) {
        await endSale(sale.id).unwrap();
        toast.success("Sale ended.");
      } else {
        await cancelSale(sale.id).unwrap();
        toast.success("Sale cancelled.");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update sale status."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-xl">
        <DialogHeader>
          <DialogTitle>Sale details</DialogTitle>
          <DialogDescription>Review pricing and update the sale window.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : isError || !sale ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
              <p className="text-xs text-muted-foreground">Failed to load this sale.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
              <DetailItem label="Status" value={<SaleStatusPill status={sale.status} />} />
              <DetailItem label="Active" value={sale.is_active ? "Yes" : "No"} />
              <DetailItem label="Base price" value={formatMoney(sale.base_price)} />
              <DetailItem label="Sale price" value={<span className="text-emerald-600">{formatMoney(sale.sale_price)}</span>} />
              <DetailItem label="Discount" value={<span className="text-red-600">-{formatPercent(sale.percentage)}</span>} />
              <DetailItem label="Created" value={formatDate(sale.created_at)} />
            </div>

            <FieldGroup className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!dateError}>
                  <FieldLabel>Start date</FieldLabel>
                  <DateTimePicker
                    value={startedAt}
                    onChange={setStartedAt}
                    min={minDateTime}
                    disabled={isMutating}
                    placeholder="Pick start date &amp; time"
                  />
                </Field>
                <Field data-invalid={!!dateError}>
                  <FieldLabel>End date</FieldLabel>
                  <DateTimePicker
                    value={endedAt}
                    onChange={setEndedAt}
                    min={startedAt || minDateTime}
                    disabled={isMutating}
                    placeholder="Pick end date &amp; time"
                  />
                </Field>
              </div>
              {dateError && <FieldError>{dateError}</FieldError>}
            </FieldGroup>

            <DialogFooter className="mt-5 flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant={sale.is_active ? "destructive" : "outline"}
                onClick={handleStatusAction}
                disabled={isMutating}
              >
                {isEnding || isCancelling ? <Icon icon="svg-spinners:180-ring" className="h-4 w-4" /> : null}
                {sale.is_active ? "End sale" : "Cancel sale"}
              </Button>
              {datesChanged && (
                <Button
                  type="button"
                  className="bg-primary-normal text-black hover:bg-primary-hover"
                  onClick={updateDates}
                  disabled={isMutating}
                >
                  {isUpdating ? <Icon icon="svg-spinners:180-ring" className="h-4 w-4" /> : null}
                  Save dates
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function VariantSalesHistoryPage({
  params,
}: {
  params: Promise<{ variantId: string }>;
}) {
  const { variantId } = use(params);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState<SaleStatus | "all">("all");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetVariantSalesQuery({
    variant_id: variantId,
    page,
    limit,
    status: status === "all" ? undefined : status,
  });

  const sales = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  const columns = useMemo<ColumnDef<Sale>[]>(
    () => [
      {
        id: "pricing",
        header: "Pricing",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-emerald-600">{formatMoney(row.original.sale_price)}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground line-through">{formatMoney(row.original.base_price)}</span>
              <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-px text-[10px] font-semibold text-red-600">
                -{formatPercent(row.original.percentage)}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "window",
        header: "Sale window",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-0 text-[11px]">
            <p className="mb-1 font-medium text-gray-700">{formatDate(row.original.started_at)}</p>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="w-px bg-gray-300 ml-[2px]" style={{ height: "16px" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <p className="mt-1 font-medium text-gray-400">{formatDate(row.original.ended_at)}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <SaleStatusPill status={row.original.status} />,
      },
      {
        id: "created",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-[11px] text-muted-foreground">{formatDate(row.original.created_at)}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md px-2 text-[11px]"
              onClick={() => setSelectedSaleId(row.original.id)}
            >
              <Icon icon="solar:eye-linear" className="h-3.5 w-3.5" />
              Details
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Sale history"
        description="All sales created for this variant."
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => router.back()}
          >
            <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon icon="solar:filter-linear" className="h-4 w-4" />
            <span>Filter by status</span>
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus((value || "all") as SaleStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {SALE_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
            <p className="text-xs text-muted-foreground">Failed to load sale history.</p>
            <button type="button" className="text-xs font-semibold text-primary-active" onClick={() => refetch()}>
              Try again
            </button>
          </CardContent>
        </Card>
      ) : !isLoading && sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-normal/10">
              <Icon icon="solar:sale-linear" className="h-6 w-6 text-primary-normal" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No sales yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                No sales found{status !== "all" ? ` with status "${status}"` : ""}.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={sales} isLoading={isLoading} skeletonRows={limit} />
      )}

      {pagination && (
        <DataTablePagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          disabled={isFetching}
        />
      )}

      <SaleDetailDialog
        saleId={selectedSaleId}
        open={!!selectedSaleId}
        onOpenChange={(open) => { if (!open) setSelectedSaleId(null); }}
      />
    </div>
  );
}

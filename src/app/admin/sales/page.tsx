"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import DateTimePicker from "@/components/Admin/DateTimePicker/DateTimePicker";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type SaleListItem,
  type SaleStatus,
  useCancelSaleMutation,
  useEndSaleMutation,
  useGetSaleDetailQuery,
  useGetSalesQuery,
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
  expired: "border-primary-normal/30 bg-primary-normal/10 text-primary-active",
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

const toDateTimeInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatInTimeZone(date, STORE_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
};

const toIsoString = (value: string) => {
  if (!value) return "";
  return fromZonedTime(value, STORE_TIMEZONE).toISOString();
};

function SaleStatusPill({ status }: { status: SaleStatus }) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone[status]}`}>
      {status}
    </span>
  );
}

const getTodayMinDateTime = () => {
  return formatInTimeZone(new Date(), STORE_TIMEZONE, "yyyy-MM-dd'T'00:00");
};

function SaleDetailDialog({
  saleId,
  sku,
  open,
  onOpenChange,
}: {
  saleId: string | null;
  sku: string | null;
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

  const originalStart = sale ? toDateTimeInputValue(sale.started_at) : "";
  const originalEnd = sale ? toDateTimeInputValue(sale.ended_at) : "";
  const datesChanged = startedAt !== originalStart || endedAt !== originalEnd;

  useEffect(() => {
    if (!sale) return;
    setStartedAt(toDateTimeInputValue(sale.started_at));
    setEndedAt(toDateTimeInputValue(sale.ended_at));
    setDateError(null);
  }, [sale]);

  const updateDates = async () => {
    if (!sale) return;
    if (!startedAt || !endedAt) {
      setDateError("Start and end dates are required.");
      return;
    }
    if (startedAt < minDateTime) {
      setDateError("Start date cannot be before today.");
      return;
    }
    if (endedAt <= startedAt) {
      setDateError("End date must be after start date.");
      return;
    }

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
      <DialogContent className="sm:max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Sale details</DialogTitle>
          <DialogDescription>
            Review pricing and update the active sale window.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : isError || !sale ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
              <p className="text-xs text-muted-foreground">Failed to load this sale.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <DetailItem label="Status" value={<SaleStatusPill status={sale.status} />} />
              <DetailItem label="SKU" value={sku ?? "—"} />
              <DetailItem label="Base price" value={formatMoney(sale.base_price)} />
              <DetailItem label="Sale price" value={formatMoney(sale.sale_price)} />
              <DetailItem label="Percentage" value={formatPercent(sale.percentage)} />
              <DetailItem label="Active" value={sale.is_active ? "Yes" : "No"} />
              <DetailItem label="Created" value={formatDate(sale.created_at)} />
              <DetailItem label="Updated" value={formatDate(sale.updated_at)} />
            </div>

            <FieldGroup className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!dateError}>
                  <FieldLabel>Start date</FieldLabel>
                  <DateTimePicker
                    value={startedAt}
                    onChange={setStartedAt}
                    min={minDateTime}
                    disabled={isMutating}
                    placeholder="Pick start date & time"
                  />
                </Field>
                <Field data-invalid={!!dateError}>
                  <FieldLabel>End date</FieldLabel>
                  <DateTimePicker
                    value={endedAt}
                    onChange={setEndedAt}
                    min={startedAt || minDateTime}
                    disabled={isMutating}
                    placeholder="Pick end date & time"
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
                {isEnding || isCancelling ? (
                  <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />
                ) : null}
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

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-800">{label}</p>
      <div className="mt-0.5 text-[11px] text-gray-400">{value}</div>
    </div>
  );
}

export default function AdminSalesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SaleStatus | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, status, startDate, endDate]);

  const { data, isLoading, isFetching, isError, refetch } = useGetSalesQuery({
    page,
    limit,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    start_date: startDate ? toIsoString(startDate) : undefined,
    end_date: endDate ? toIsoString(endDate) : undefined,
  });

  const sales = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const isTableLoading = isLoading || (isFetching && sales.length === 0);

  const columns = useMemo<ColumnDef<SaleListItem>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.product.name}</p>
          </div>
        ),
      },
      {
        id: "variant",
        header: "Variant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.variant.display_name}</p>
            <p className="text-[11px] text-muted-foreground">SKU: {row.original.variant.sku}</p>
          </div>
        ),
      },
      {
        id: "pricing",
        header: "Pricing",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <p className="text-base font-semibold text-emerald-600">
              {formatMoney(row.original.sale.sale_price)}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground line-through">
                {formatMoney(row.original.sale.base_price)}
              </span>
              <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-px text-[10px] font-semibold text-red-600">
                -{formatPercent(row.original.sale.percentage)}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "window",
        header: "Window",
        cell: ({ row }) => (
          <div className="flex flex-col items-center gap-0 text-[11px]">
            {/* Start date above the top dot */}
            <p className="mb-1 font-medium text-gray-700">{formatDate(row.original.sale.started_at)}</p>
            {/* Top dot */}
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {/* Vertical line */}
            <span className="w-px bg-gray-300" style={{ height: "18px" }} />
            {/* Bottom dot */}
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            {/* End date below the bottom dot */}
            <p className="mt-1 font-medium text-gray-400">{formatDate(row.original.sale.ended_at)}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <SaleStatusPill status={row.original.sale.status} />,
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
              onClick={() => {
                setSelectedSaleId(row.original.sale.id);
                setSelectedSku(row.original.variant.sku);
              }}
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
        title="Sales"
        description="Manage variant-level sale windows and pricing."
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1.4fr)_180px_180px_180px]">
          <div className="relative">
            <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search product, variant, or SKU"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => setStatus((value || "all") as SaleStatus | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {SALE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="datetime-local"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            aria-label="Start date filter"
            className="[color-scheme:light] focus-visible:ring-primary-normal accent-primary-normal"
          />
          <Input
            type="datetime-local"
            min={startDate || undefined}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            aria-label="End date filter"
            className="[color-scheme:light] focus-visible:ring-primary-normal accent-primary-normal"
          />
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
            <p className="text-xs text-muted-foreground">Failed to load sales.</p>
            <button type="button" className="text-xs font-semibold text-primary-active" onClick={() => refetch()}>
              Try again
            </button>
          </CardContent>
        </Card>
      ) : !isTableLoading && sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:sale-linear" className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No sales match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={sales} isLoading={isTableLoading} skeletonRows={5} />
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
        sku={selectedSku}
        open={!!selectedSaleId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSaleId(null);
            setSelectedSku(null);
          }
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatOrderDate,
  formatOrderMoney,
  formatOrderNumber,
  fulfillmentLabel,
  fulfillmentSequence,
  getOrderScheduledEnd,
  getOrderScheduledStart,
  getRefundCaseStatusLabel,
  getRefundCaseTypeLabel,
  getRefundReasonLabel,
  getRefundStatusLabel,
  getRefundStatusTone,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import { CancelOrderDialog } from "@/components/Admin/CancelOrderDialog/CancelOrderDialog";
import { CreateRefundDialog } from "@/components/Admin/CreateRefundDialog/CreateRefundDialog";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useUploadMediaMutation } from "@/redux/features/media/mediaApiSlice";
import {
  type DeliveryRefusalReason,
  type FulfillmentAttachmentCategory,
  type FulfillmentEventType,
  type FulfillmentMethod,
  type FulfillmentStatus,
  useGetAdminOrderQuery,
  useUpdateOrderFulfillmentMutation,
} from "@/redux/features/order/orderApiSlice";

const refusalReasons: Array<{ value: DeliveryRefusalReason; label: string }> = [
  { value: "ID_INVALID", label: "Invalid ID" },
  { value: "CUSTOMER_INTOXICATED", label: "Customer intoxicated" },
  { value: "OTHER", label: "Other" },
];

const attachmentCategories: Array<{
  value: FulfillmentAttachmentCategory;
  label: string;
}> = [
    { value: "AGE_VERIFICATION", label: "Age Verification" },
    { value: "REFUSAL_EVIDENCE", label: "Refusal Evidence" },
    { value: "OTHER", label: "Other" },
    { value: "GENERAL_PHOTO", label: "General Photo" },
  ];

const errorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error))
    return "Failed to update fulfillment status.";
  const data = error.data as
    | { error?: { message?: string }; message?: string }
    | undefined;
  return (
    data?.error?.message ??
    data?.message ??
    "Failed to update fulfillment status."
  );
};

const getNextFulfillmentStatuses = (
  currentStatus?: FulfillmentStatus,
  method?: FulfillmentMethod,
): FulfillmentStatus[] => {
  if (!currentStatus) return [];

  if (method === "PICKUP") {
    switch (currentStatus) {
      case "PENDING":
        return ["PREPARING"];
      case "PREPARING":
        return ["READY_FOR_PICKUP"];
      case "READY_FOR_PICKUP":
        return ["PICKED_UP", "REFUSED"];
      case "PICKED_UP":
      case "REFUSED":
      default:
        return [];
    }
  }

  // Delivery
  switch (currentStatus) {
    case "PENDING":
      return ["PREPARING"];
    case "PREPARING":
      return ["READY_FOR_DELIVERY"];
    case "READY_FOR_DELIVERY":
      return ["OUT_FOR_DELIVERY"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED", "REFUSED"];
    case "DELIVERED":
    case "REFUSED":
    default:
      return [];
  }
};

interface AttachedMediaItem {
  id: string;
  media_id: string;
  url: string;
  category: FulfillmentAttachmentCategory;
  label: string;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetAdminOrderQuery(id);
  const order = data?.data;
  const [status, setStatus] = useState<FulfillmentStatus>("PENDING");
  const [refusalReason, setRefusalReason] = useState<
    DeliveryRefusalReason | ""
  >("");
  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState<AttachedMediaItem[]>([]);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateFulfillment, { isLoading: isUpdating }] =
    useUpdateOrderFulfillmentMutation();
  const [uploadMedia, { isLoading: isUploadingMedia }] =
    useUploadMediaMutation();

  const isCurrentOutForDelivery =
    order?.fulfillment_status === "OUT_FOR_DELIVERY";

  const isCancelled = order?.status === "CANCELLED";
  const hasRefunds = Boolean(
    (order?.refund_cases && order.refund_cases.length > 0) ||
    (order?.unassociated_payment_refunds && order.unassociated_payment_refunds.length > 0),
  );
  const isFulfillmentLocked = isCancelled || hasRefunds;

  const nextStatuses = useMemo<FulfillmentStatus[]>(() => {
    if (!order || isCancelled) return [];
    return getNextFulfillmentStatuses(
      order.fulfillment_status,
      order.fulfillment_method,
    );
  }, [order, isCancelled]);

  const isTerminalStatus = Boolean(order && (isCancelled || nextStatuses.length === 0));

  useEffect(() => {
    if (order) {
      const next = getNextFulfillmentStatuses(
        order.fulfillment_status,
        order.fulfillment_method,
      );
      if (next.length > 0 && !isCancelled) {
        setStatus(next[0]);
      } else {
        setStatus(order.fulfillment_status);
      }
    }
  }, [order, isCancelled]);

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(
        files.map((file) => uploadMedia(file).unwrap()),
      );
      const defaultCategory: FulfillmentAttachmentCategory =
        status === "REFUSED" ? "REFUSAL_EVIDENCE" : "AGE_VERIFICATION";

      const newItems: AttachedMediaItem[] = uploaded.map((res, i) => ({
        id: `${res.data.id}-${Date.now()}-${i}`,
        media_id: res.data.id,
        url: res.data.url,
        category: defaultCategory,
        label: "",
      }));
      setAttachments((prev) => [...prev, ...newItems]);
      toast.success(
        `Uploaded ${files.length} image${files.length > 1 ? "s" : ""}.`,
      );
    } catch {
      toast.error("Failed to upload image(s).");
    }
  };

  const updateAttachment = (
    index: number,
    patch: Partial<AttachedMediaItem>,
  ) => {
    setAttachments((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    );
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const dropdownItems = useMemo(() => {
    if (!order) return [];
    if (isCancelled) {
      return [
        {
          value: order.fulfillment_status,
          label: `${fulfillmentLabel[order.fulfillment_status]} (Cancelled)`,
          disabled: true,
        },
      ];
    }
    if (isTerminalStatus) {
      return [
        {
          value: order.fulfillment_status,
          label: `${fulfillmentLabel[order.fulfillment_status]} (Completed)`,
          disabled: true,
        },
      ];
    }
    return nextStatuses.map((value) => ({
      value,
      label: fulfillmentLabel[value],
      disabled: false,
    }));
  }, [order, isCancelled, isTerminalStatus, nextStatuses]);

  const saveStatus = async () => {
    if (isFulfillmentLocked || isTerminalStatus || !nextStatuses.includes(status)) {
      toast.error(
        isCancelled
          ? "Cannot update fulfillment for a cancelled order."
          : "No further status transitions available.",
      );
      return;
    }
    if (status === "REFUSED" && !refusalReason) {
      toast.error("Choose a refusal reason.");
      return;
    }
    try {
      await updateFulfillment({
        order_id: id,
        fulfillment_status: status,
        refusal_reason:
          status === "REFUSED"
            ? (refusalReason as DeliveryRefusalReason)
            : null,
        note: note.trim(),
        ...(isCurrentOutForDelivery
          ? {
            attachments: attachments.map((att) => ({
              media_id: att.media_id,
              category: att.category,
              label: att.label.trim(),
            })),
          }
          : {}),
      }).unwrap();
      toast.success("Fulfillment status updated.");
      setNote("");
      setAttachments([]);
      if (status !== "REFUSED") setRefusalReason("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (isLoading) return <Skeleton className="h-[680px] w-full" />;
  if (isError || !order) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 border bg-card text-center">
        <Icon
          icon="solar:danger-circle-linear"
          className="size-8 text-destructive"
        />
        <p className="text-sm font-semibold">Couldn&apos;t load this order.</p>
        <div className="flex gap-4">
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold text-primary-active"
          >
            Try again
          </button>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-gray-500"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const sequence = fulfillmentSequence(order.fulfillment_method);
  const events = [...order.fulfillment_events].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const eventByType = new Map(events.map((event) => [event.event_type, event]));
  const refused = events.find((event) => event.event_type === "REFUSED");
  const currentIndex = sequence.indexOf(
    order.fulfillment_status as FulfillmentEventType,
  );
  const scheduledStart = getOrderScheduledStart(order);
  const scheduledEnd = getOrderScheduledEnd(order);
  const hasRefundCases = Boolean(
    order.refund_cases && order.refund_cases.length > 0,
  );
  const hasUnassociatedRefunds = Boolean(
    order.unassociated_payment_refunds &&
    order.unassociated_payment_refunds.length > 0,
  );

  const cancellable = Boolean(order.can_cancel);
  const refundable = Boolean(order.can_create_refund_case);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title={`Order ${formatOrderNumber(order)}`}
        description={
          <span>
            Placed {formatOrderDate(order.created_at)} by {order.customer.name}
            <span className="ml-2 font-mono text-[11px] text-muted-foreground">
              (ID: {order.id})
            </span>
          </span>
        }
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-foreground"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
              All orders
            </Link>
            {cancellable && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsCancelDialogOpen(true)}
                className="gap-1.5 text-xs rounded-full cursor-pointer"
              >
                Cancel Order
              </Button>
            )}
            {refundable && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsRefundDialogOpen(true)}
                className="gap-1.5 text-xs rounded-full cursor-pointer"
              >
                Create Refund
              </Button>
            )}
          </div>
        }
      />

      <CancelOrderDialog
        order={order}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      />

      <CreateRefundDialog
        order={order}
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">

          <section
            className={`border p-5 ring-1 bg-card ring-foreground/5`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[order.status]}`}
                >
                  {orderStatusLabel[order.status]}
                </span>
                <span className="rounded-full border border-primary-normal/30 bg-primary-normal/10 px-2.5 py-1 text-[11px] font-medium text-primary-active">
                  {order.fulfillment_method === "PICKUP"
                    ? "Pickup"
                    : "Delivery"}
                </span>
                {hasRefunds && (
                  <span className="rounded-full border border-gray-300 bg-gray-200/80 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                    Refund / Cancel Record Present
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-500">Current progress</p>
                <p className="text-sm font-semibold">
                  {fulfillmentLabel[order.fulfillment_status]}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-gray-500">Customer</p>
                <p className="mt-1 text-sm font-semibold">
                  {order.customer.name}
                </p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-xs text-primary-active"
                >
                  {order.customer.email}
                </a>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Scheduled window</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatOrderDate(scheduledStart)}
                </p>
                {scheduledEnd && (
                  <p className="text-xs text-gray-500">
                    until {formatOrderDate(scheduledEnd)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Payment</p>
                <p className="mt-1 text-sm font-semibold">
                  {order.payment?.status ?? "Unavailable"}
                </p>
                {order.payment && (
                  <p className="text-xs text-gray-500">
                    {order.payment.provider}
                  </p>
                )}
              </div>
            </div>
          </section>


          {hasRefundCases && (
            <section className="border bg-card p-5 ring-1 ring-foreground/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:card-recive-linear"
                    className="size-4 text-primary-active"
                  />
                  <h2 className="text-sm font-semibold">Refund cases</h2>
                </div>
                <span className="text-[11px] text-gray-500">
                  {order.refund_cases!.length}{" "}
                  {order.refund_cases!.length === 1 ? "case" : "cases"}
                </span>
              </div>

              <div className="space-y-4">
                {order.refund_cases!.map((caseItem, idx) => (
                  <div
                    key={caseItem.id || `case-${idx}`}
                    className="rounded-lg border bg-gray-100 p-4 text-xs space-y-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-primary-normal/40 bg-primary-normal/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary-active">
                            {getRefundCaseTypeLabel(caseItem.case_type)}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getRefundStatusTone(
                              caseItem.status,
                            )}`}
                          >
                            {getRefundCaseStatusLabel(caseItem.status)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                          Reason: {getRefundReasonLabel(caseItem.reason)}
                        </p>
                      </div>

                      <div className="text-right text-[11px] text-gray-500">
                        <p className="font-medium text-foreground">
                          {caseItem.created_by?.name ? (
                            <>Created by {caseItem.created_by.name}</>
                          ) : (
                            "Created by Admin"
                          )}
                        </p>
                        {caseItem.created_by?.email && (
                          <p>{caseItem.created_by.email}</p>
                        )}
                        <p className="text-[10px]">
                          {formatOrderDate(caseItem.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Note if available */}
                    {caseItem.note && (
                      <div className="rounded bg-background/80 p-2.5 text-[11px] border border-border/60">
                        <span className="font-semibold text-foreground">Note: </span>
                        <span className="text-gray-500">{caseItem.note}</span>
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-gray-500">
                        Financial Summary
                      </p>
                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-card p-3 text-[11px] sm:grid-cols-4 border">
                        <div>
                          <span className="text-gray-500">Merchandise:</span>
                          <p className="font-medium">
                            {formatOrderMoney(
                              caseItem.merchandise_refund,
                              caseItem.currency || order.currency,
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Delivery:</span>
                          <p className="font-medium">
                            {formatOrderMoney(
                              caseItem.delivery_refund,
                              caseItem.currency || order.currency,
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cancellation fee:</span>
                          <p className="font-medium">
                            {formatOrderMoney(
                              caseItem.cancellation_fee,
                              caseItem.currency || order.currency,
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Final refund:</span>
                          <p className="font-semibold text-primary-active text-xs">
                            {formatOrderMoney(
                              caseItem.final_refund,
                              caseItem.currency || order.currency,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items table / breakdown */}
                    {caseItem.items && caseItem.items.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        <p className="text-[11px] font-semibold text-gray-500">
                          Case items ({caseItem.items.length})
                        </p>
                        <div className="space-y-2">
                          {caseItem.items.map((item, itemIdx) => (
                            <div
                              key={item.id || `case-item-${itemIdx}`}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card p-2.5 text-[11px]"
                            >
                              <div className="space-y-0.5">
                                <p className="font-medium text-foreground">
                                  {item.product_name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {item.variant_name
                                    ? `${item.variant_name} · `
                                    : ""}
                                  {item.sku ? `SKU: ${item.sku} · ` : ""}
                                  Qty: {item.quantity} ×{" "}
                                  {formatOrderMoney(
                                    item.unit_price,
                                    caseItem.currency || order.currency,
                                  )}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px]">
                                  {item.condition && (
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                                      Condition:{" "}
                                      {item.condition
                                        .replaceAll("_", " ")
                                        .toLowerCase()}
                                    </span>
                                  )}
                                  {item.disposition && (
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                                      Disposition:{" "}
                                      {item.disposition
                                        .replaceAll("_", " ")
                                        .toLowerCase()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-gray-500 block">
                                  Line refund
                                </span>
                                <span className="font-semibold text-foreground">
                                  {formatOrderMoney(
                                    item.line_refund,
                                    caseItem.currency || order.currency,
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Associated Payment Refunds */}
                    {caseItem.payment_refunds &&
                      caseItem.payment_refunds.length > 0 && (
                        <div className="space-y-2 border-t pt-3">
                          <p className="text-[11px] font-semibold text-gray-500">
                            Payment Refunds ({caseItem.payment_refunds.length})
                          </p>
                          <div className="space-y-2">
                            {caseItem.payment_refunds.map((pr, prIdx) => (
                              <div
                                key={pr.id || `case-pr-${prIdx}`}
                                className="rounded-md border bg-card p-2.5 text-[11px] space-y-1.5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRefundStatusTone(
                                        pr.status,
                                      )}`}
                                    >
                                      {pr.status}
                                    </span>
                                    <span className="rounded border bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-medium">
                                      Source: {pr.source}
                                    </span>
                                    <span className="text-gray-500">
                                      {getRefundReasonLabel(pr.reason)}
                                    </span>
                                  </div>
                                  <span className="font-bold text-foreground">
                                    {formatOrderMoney(
                                      pr.amount,
                                      pr.currency ||
                                      caseItem.currency ||
                                      order.currency,
                                    )}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
                                  <span>
                                    Requested: {formatOrderDate(pr.requested_at)}
                                  </span>
                                  {pr.completed_at && (
                                    <span>
                                      Completed:{" "}
                                      {formatOrderDate(pr.completed_at)}
                                    </span>
                                  )}
                                  {pr.failed_at && (
                                    <span className="text-destructive font-medium">
                                      Failed: {formatOrderDate(pr.failed_at)}
                                    </span>
                                  )}
                                </div>

                                {pr.failure_message && (
                                  <div className="rounded bg-destructive/10 p-2 text-[10px] text-destructive">
                                    <span className="font-semibold">
                                      Failure ({pr.failure_code || "Error"}):{" "}
                                    </span>
                                    {pr.failure_message}
                                  </div>
                                )}

                                {pr.note && (
                                  <p className="text-[10px] text-gray-500">
                                    Note: {pr.note}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 3. UNASSOCIATED PAYMENT REFUNDS (System created)           */}
          {/* ========================================================= */}
          {hasUnassociatedRefunds && (
            <section className="border bg-card p-5 ring-1 ring-foreground/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:server-square-linear"
                    className="size-4 text-primary-active"
                  />
                  <h2 className="text-sm font-semibold">
                    Automatic / System payment refunds
                  </h2>
                </div>
                <span className="text-[11px] text-gray-500">
                  {order.unassociated_payment_refunds!.length}{" "}
                  {order.unassociated_payment_refunds!.length === 1
                    ? "refund"
                    : "refunds"}
                </span>
              </div>

              <div className="space-y-3">
                {order.unassociated_payment_refunds!.map((pr, idx) => (
                  <div
                    key={pr.id || `unassociated-pr-${idx}`}
                    className="rounded-lg border bg-gray-100 p-3.5 text-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRefundStatusTone(
                            pr.status,
                          )}`}
                        >
                          {pr.status}
                        </span>
                        <span className="rounded border bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-medium">
                          Source: {pr.source}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {getRefundReasonLabel(pr.reason)}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-foreground">
                        {formatOrderMoney(
                          pr.amount,
                          pr.currency || order.currency,
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      <span>Requested: {formatOrderDate(pr.requested_at)}</span>
                      {pr.completed_at && (
                        <span>
                          Completed: {formatOrderDate(pr.completed_at)}
                        </span>
                      )}
                      {pr.failed_at && (
                        <span className="text-destructive font-medium">
                          Failed: {formatOrderDate(pr.failed_at)}
                        </span>
                      )}
                    </div>

                    {pr.failure_message && (
                      <div className="rounded bg-destructive/10 p-2 text-[11px] text-destructive">
                        <span className="font-semibold">
                          Failure ({pr.failure_code || "Error"}):{" "}
                        </span>
                        {pr.failure_message}
                      </div>
                    )}

                    {pr.note && (
                      <div className="rounded bg-card p-2 text-[11px] text-gray-500 border">
                        <span className="font-semibold text-foreground">
                          Note:{" "}
                        </span>
                        {pr.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. BELOW: FULFILLMENT HISTORY (Disabled if refunds)        */}
          {/* ========================================================= */}
          <section
            className={`border p-5 ring-1 ${hasRefunds
              ? "bg-gray-100 border-gray-200 ring-black/5 opacity-80"
              : "bg-card ring-foreground/5"
              }`}
          >
            <h2 className="text-sm font-semibold">Fulfillment history</h2>
            <div className="mt-5 space-y-0">
              <div className="relative flex gap-3 pb-6">
                <span className="absolute left-3 top-6 h-full w-px bg-primary-normal" />
                <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-normal">
                  <Icon icon="solar:check-read-linear" className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Order placed</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {formatOrderDate(order.created_at)}
                  </p>
                </div>
              </div>
              {sequence.map((eventType, index) => {
                const event = eventByType.get(eventType);
                const complete =
                  !!event ||
                  currentIndex > index ||
                  order.status === "FULFILLED";
                return (
                  <div
                    key={eventType}
                    className="relative flex gap-3 pb-6 last:pb-0"
                  >
                    {index < sequence.length - 1 && (
                      <span
                        className={`absolute left-3 top-6 h-full w-px ${complete ? "bg-primary-normal" : "bg-border"}`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ${complete ? "bg-primary-normal ring-primary-normal" : "bg-card text-gray-500 ring-border"}`}
                    >
                      <Icon
                        icon={
                          complete
                            ? "solar:check-read-linear"
                            : "solar:clock-circle-linear"
                        }
                        className="size-3.5"
                      />
                    </span>
                    <div>
                      <p
                        className={`text-xs font-semibold ${complete ? "" : "text-gray-500"}`}
                      >
                        {fulfillmentLabel[eventType]}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {event
                          ? formatOrderDate(event.created_at)
                          : order.fulfillment_status === eventType
                            ? "In progress"
                            : "Pending"}
                      </p>
                      {event?.note && (
                        <p className="mt-2 bg-gray-200/70 p-2 text-xs">
                          {event.note}
                        </p>
                      )}
                      {event?.attachments && event.attachments.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {event.attachments.map((att, attIdx) => (
                            <div
                              key={att.id || att.media_id || `att-${attIdx}`}
                              className="flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-2xs text-[11px]"
                            >
                              {att.media?.url && (
                                <a
                                  href={att.media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block shrink-0"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={att.media.url}
                                    alt={att.label || "Attachment"}
                                    className="size-10 rounded object-cover border"
                                  />
                                </a>
                              )}
                              <div className="text-[10px] space-y-0.5">
                                <span className="font-semibold text-foreground block">
                                  {att.category.replaceAll("_", " ")}
                                </span>
                                {att.label && (
                                  <span className="text-gray-500 block">
                                    {att.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {refused && (
                <div className="mt-6 flex gap-3 text-destructive">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                    <Icon
                      icon="solar:close-circle-linear"
                      className="size-3.5"
                    />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Refused</p>
                    <p className="mt-0.5 text-[11px]">
                      {formatOrderDate(refused.created_at)}
                    </p>
                    {refused.refusal_reason && (
                      <p className="mt-1 text-xs">
                        Reason:{" "}
                        {refused.refusal_reason
                          .replaceAll("_", " ")
                          .toLowerCase()}
                      </p>
                    )}
                    {refused.note && (
                      <p className="mt-2 bg-destructive/5 p-2 text-xs">
                        {refused.note}
                      </p>
                    )}
                    {refused.attachments && refused.attachments.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {refused.attachments.map((att, attIdx) => (
                          <div
                            key={att.id || att.media_id || `refused-att-${attIdx}`}
                            className="flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-2xs text-[11px]"
                          >
                            {att.media?.url && (
                              <a
                                href={att.media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block shrink-0"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={att.media.url}
                                  alt={att.label || "Attachment"}
                                  className="size-10 rounded object-cover border"
                                />
                              </a>
                            )}
                            <div className="text-[10px] space-y-0.5">
                              <span className="font-semibold text-foreground block">
                                {att.category.replaceAll("_", " ")}
                              </span>
                              {att.label && (
                                <span className="text-gray-500 block">
                                  {att.label}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. BELOW: ORDER ITEMS (Disabled with gray-100 if refunds)  */}
          {/* ========================================================= */}
          <section
            className={`border p-5 ring-1 ${hasRefunds
              ? "bg-gray-100 border-gray-200 ring-black/5 opacity-80"
              : "bg-card ring-foreground/5"
              }`}
          >
            <h2 className="text-sm font-semibold">Order items</h2>
            <div className="mt-3 divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-xs font-semibold">{item.product_name}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.volume_ml}ml · {item.quantity} ×{" "}
                      {formatOrderMoney(item.unit_price, order.currency)}
                    </p>
                  </div>
                  <p className="text-xs font-semibold">
                    {formatOrderMoney(item.line_total, order.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="ml-auto mt-4 max-w-xs space-y-2 border-t pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatOrderMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery fee</span>
                <span>
                  {formatOrderMoney(order.delivery_fee, order.currency)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span>Total</span>
                <span>{formatOrderMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. BELOW: DELIVERY DETAILS (Disabled if refunds)          */}
          {/* ========================================================= */}
          {order.delivery && (
            <section
              className={`border p-5 text-xs ring-1 ${hasRefunds
                ? "bg-gray-100 border-gray-200 ring-black/5 opacity-80"
                : "bg-card ring-foreground/5"
                }`}
            >
              <h2 className="text-sm font-semibold">Delivery details</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Recipient and address</p>
                  <p className="mt-1 font-semibold">
                    {order.delivery.recipient_first_name}{" "}
                    {order.delivery.recipient_last_name}
                  </p>
                  <p className="mt-1 leading-5">
                    {order.delivery.address_line1}
                    <br />
                    {order.delivery.address_line2 && (
                      <>
                        {order.delivery.address_line2}
                        <br />
                      </>
                    )}
                    {order.delivery.city}, {order.delivery.state}{" "}
                    {order.delivery.zip_code}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Handoff instructions</p>
                  <p className="mt-1 leading-5">
                    {order.delivery.handoff_instructions ||
                      "No instructions provided."}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT ASIDE: UPDATE FULFILLMENT                           */}
        {/* ========================================================= */}
        <aside
          className={`h-fit border p-5 ring-1 xl:sticky xl:top-20 ${isFulfillmentLocked
            ? "bg-gray-100 border-gray-200 ring-black/5 opacity-85"
            : "bg-card ring-foreground/5"
            }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Update fulfillment</h2>
            {isCancelled ? (
              <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                Cancelled
              </span>
            ) : hasRefunds ? (
              <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                Disabled
              </span>
            ) : isTerminalStatus ? (
              <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                Completed
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {isCancelled
              ? "Fulfillment updates are locked because this order has been cancelled."
              : hasRefunds
                ? "Fulfillment updates are locked because this order has refund or cancellation records."
                : isTerminalStatus
                  ? "Fulfillment has reached its final state. No further updates are available."
                  : "This creates a fulfillment event visible to the customer."}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Change  Fulfillment status
              </label>
              <Select
                disabled={isFulfillmentLocked || isUpdating || isTerminalStatus}
                items={dropdownItems}
                value={status}
                onValueChange={(value) => value && setStatus(value)}
              >
                <SelectTrigger className="h-10 w-full bg-white disabled:bg-gray-200/60 disabled:cursor-not-allowed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dropdownItems.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {status === "REFUSED" && !isTerminalStatus && (
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Refusal reason
                </label>
                <Select
                  disabled={isFulfillmentLocked || isUpdating}
                  items={refusalReasons}
                  value={refusalReason || null}
                  onValueChange={(value) => setRefusalReason(value ?? "")}
                >
                  <SelectTrigger className="h-10 w-full bg-white disabled:bg-gray-200/60 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Choose a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {refusalReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isCurrentOutForDelivery && !isTerminalStatus && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-medium">
                    Delivery Attachments ({attachments.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFulfillmentLocked || isUpdating || isUploadingMedia}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-active hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    <Icon icon="solar:camera-add-bold" className="size-3.5" />
                    Add images
                  </button>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-72 overflow-y-auto pr-1">
                    {attachments.map((att, idx) => (
                      <div
                        key={att.id}
                        className="flex items-start gap-2.5 rounded-lg border bg-white p-2.5 text-xs shadow-2xs"
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.url}
                            alt=""
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <Select
                            value={att.category}
                            disabled={isFulfillmentLocked || isUpdating}
                            onValueChange={(val) =>
                              val &&
                              updateAttachment(idx, {
                                category: val as FulfillmentAttachmentCategory,
                              })
                            }
                          >
                            <SelectTrigger className="h-7 w-full text-[11px] bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {attachmentCategories.map((cat) => (
                                <SelectItem
                                  key={cat.value}
                                  value={cat.value}
                                  className="text-xs"
                                >
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={att.label}
                            disabled={isFulfillmentLocked || isUpdating}
                            onChange={(e) =>
                              updateAttachment(idx, { label: e.target.value })
                            }
                            placeholder="Label (optional)"
                            className="h-7 text-[11px]"
                          />
                        </div>
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => removeAttachment(idx)}
                          disabled={isFulfillmentLocked || isUpdating}
                          className="p-1 text-gray-400 hover:text-destructive cursor-pointer disabled:opacity-40"
                        >
                          <Icon
                            icon="solar:trash-bin-minimalistic-linear"
                            className="size-4"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isFulfillmentLocked || isUpdating || isUploadingMedia}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/60 p-3 text-xs text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingMedia ? (
                    <>
                      <Icon
                        icon="svg-spinners:180-ring"
                        className="size-4 text-primary-active"
                      />
                      <span>Uploading image(s)...</span>
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="solar:gallery-add-linear"
                        className="size-4 text-gray-500"
                      />
                      <span>Attach image(s) for verification or evidence</span>
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />
              </div>
            )}
            <div>
              <label
                htmlFor="fulfillment-note"
                className="mb-1.5 block text-xs font-medium"
              >
                Note
              </label>
              <Textarea
                id="fulfillment-note"
                value={note}
                disabled={isFulfillmentLocked || isUpdating || isTerminalStatus}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder={
                  isCancelled
                    ? "Fulfillment updates locked because order is cancelled"
                    : hasRefunds
                      ? "Fulfillment updates disabled for this order"
                      : isTerminalStatus
                        ? "Fulfillment has reached its final state"
                        : "Add a description or update for the customer"
                }
                className="min-h-28 resize-none bg-white disabled:bg-gray-200/60 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-right text-[10px] text-gray-500">
                {note.length}/500
              </p>
            </div>
            <Button
              onClick={saveStatus}
              disabled={isFulfillmentLocked || isUpdating || isTerminalStatus || isUploadingMedia}
              className="w-full bg-primary-normal text-black hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isUpdating && (
                <Icon icon="svg-spinners:180-ring" className="size-4" />
              )}
              {isCancelled
                ? "Order Cancelled"
                : hasRefunds
                  ? "Updates Locked"
                  : isTerminalStatus
                    ? "Order Completed"
                    : "Update status"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

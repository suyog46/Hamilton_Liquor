"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { formatOrderMoney } from "@/components/Order/orderDisplay";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type AdminOrder,
  type CancellationPreviewData,
  type ItemCondition,
  type ItemDisposition,
  type RefundCaseItemInput,
  type RefundReason,
  useCreateRefundCaseMutation,
  usePreviewRefundCaseMutation,
} from "@/redux/features/order/orderApiSlice";

export interface RefundRule {
  status: string;
  fulfillment_status: string;
  reasons: RefundReason[];
}

export const REFUND_RULES: RefundRule[] = [
  {
    status: "FULFILLED",
    fulfillment_status: "DELIVERED",
    reasons: [
      "CUSTOMER_CANCELLED",
      "STORE_CANCELLED",
      "ITEM_UNAVAILABLE",
      "CUSTOMER_RETURN",
      "DAMAGED_ITEM",
      "INCORRECT_ITEM",
      "MISSING_ITEM",
      "REFUSED_DELIVERY",
      "OTHER",
    ],
  },
  {
    status: "REFUSED",
    fulfillment_status: "REFUSED",
    reasons: ["REFUSED_DELIVERY"],
  },
];

export function getRefundReasons(status?: string, fulfillmentStatus?: string): RefundReason[] {
  if (!status || !fulfillmentStatus) return [];
  const matchedRule = REFUND_RULES.find(
    (rule) =>
      rule.status.toUpperCase() === status.toUpperCase() &&
      rule.fulfillment_status.toUpperCase() === fulfillmentStatus.toUpperCase()
  );
  return matchedRule ? matchedRule.reasons : [];
}

export function isOrderRefundable(status?: string, fulfillmentStatus?: string): boolean {
  return getRefundReasons(status, fulfillmentStatus).length > 0;
}

const REASON_LABELS: Record<RefundReason, string> = {
  CUSTOMER_CANCELLED: "Customer Cancelled",
  STORE_CANCELLED: "Store Cancelled",
  ITEM_UNAVAILABLE: "Item Unavailable",
  CUSTOMER_RETURN: "Customer Return",
  DAMAGED_ITEM: "Damaged Item",
  INCORRECT_ITEM: "Incorrect Item",
  MISSING_ITEM: "Missing Item",
  REFUSED_DELIVERY: "Refused Delivery",
  OTHER: "Other",
};

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
  { value: "UNOPENED", label: "Unopened" },
  { value: "OPENED", label: "Opened" },
  { value: "DAMAGED", label: "Damaged" },
];

const DISPOSITION_OPTIONS: { value: ItemDisposition; label: string }[] = [
  { value: "RESELLABLE", label: "Resellable" },
  { value: "DAMAGED", label: "Damaged" },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { error?: { message?: string }; message?: string } | undefined;
    return data?.error?.message ?? data?.message ?? fallback;
  }
  return fallback;
};

interface RefundItemState extends RefundCaseItemInput {
  selected: boolean;
}

interface CreateRefundDialogProps {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRefundDialog({ order, open, onOpenChange }: CreateRefundDialogProps) {
  const availableReasons = getRefundReasons(order.status, order.fulfillment_status);
  const isRefusedOrder =
    order.status.toUpperCase() === "REFUSED" &&
    order.fulfillment_status.toUpperCase() === "REFUSED";

  const [reason, setReason] = useState<RefundReason | "">("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<RefundItemState[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isFirstStepCompleted, setIsFirstStepCompleted] = useState(false);
  const [previewData, setPreviewData] = useState<CancellationPreviewData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [previewRefundCase, { isLoading: isPreviewing }] = usePreviewRefundCaseMutation();
  const [createRefundCase, { isLoading: isConfirming }] = useCreateRefundCaseMutation();

  useEffect(() => {
    if (open) {
      setReason(isRefusedOrder ? "REFUSED_DELIVERY" : availableReasons[0] ?? "");
      setNote("");
      setIdempotencyKey(crypto.randomUUID());
      setIsFirstStepCompleted(false);
      setPreviewData(null);
      setErrors({});
      setItems(
        order.items.map((item) => ({
          order_item_id: item.id,
          quantity: item.quantity,
          condition: "NOT_APPLICABLE",
          disposition: "RESELLABLE",
          selected: true,
        }))
      );
    }
  }, [open, order, availableReasons, isRefusedOrder]);

  const handleItemChange = (
    orderItemId: string,
    field: keyof RefundCaseItemInput,
    value: unknown
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.order_item_id === orderItemId ? { ...item, [field]: value } : item))
    );
  };

  const toggleItemSelection = (orderItemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.order_item_id === orderItemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const getSelectedItemsPayload = (): RefundCaseItemInput[] => {
    return items
      .filter((item) => item.selected)
      .map(({ order_item_id, quantity, condition, disposition }) => ({
        order_item_id,
        quantity,
        condition,
        disposition,
      }));
  };

  const handlePreviewStep = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPayload = getSelectedItemsPayload();
    const nextErrors: Record<string, string> = {};

    if (!reason) nextErrors.reason = "Please select a refund reason.";
    if (selectedPayload.length === 0) {
      nextErrors.items = "Please select at least one item to refund.";
      toast.error("Please select at least one item to refund.");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const res = await previewRefundCase({
        order_id: order.id,
        body: {
          reason: reason as RefundReason,
          items: selectedPayload,
          note: note.trim() || undefined,
        },
      }).unwrap();

      setPreviewData(res.data);
      if (!idempotencyKey) {
        setIdempotencyKey(crypto.randomUUID());
      }
      setIsFirstStepCompleted(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate refund preview."));
    }
  };

  const handleConfirmStep = async () => {
    const selectedPayload = getSelectedItemsPayload();
    if (!reason || selectedPayload.length === 0) return;

    try {
      await createRefundCase({
        order_id: order.id,
        body: {
          reason: reason as RefundReason,
          items: selectedPayload,
          note: note.trim() || undefined,
        },
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
      }).unwrap();

      toast.success("Refund case created successfully.");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to confirm refund case."));
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Refund Case</DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(-8).toUpperCase()} —{" "}
            {isFirstStepCompleted
              ? "Step 2: Preview Summary & Confirmation"
              : "Step 1: Reason, Notes & Items Inspection"}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="mt-2 flex items-center justify-between rounded-lg border p-2.5 text-xs">
          <div
            className={`flex items-center gap-2 font-medium ${
              !isFirstStepCompleted ? "text-primary-active font-semibold" : "text-muted-foreground"
            }`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                !isFirstStepCompleted
                  ? "bg-primary-normal text-black font-bold"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {isFirstStepCompleted ? <Icon icon="solar:check-read-linear" className="size-3" /> : "1"}
            </span>
            Step 1: Details & Inspection
          </div>
          <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground/60" />
          <div
            className={`flex items-center gap-2 font-medium ${
              isFirstStepCompleted ? "text-primary-active font-semibold" : "text-muted-foreground"
            }`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                isFirstStepCompleted ? "bg-primary-normal text-black font-bold" : "bg-gray-100 text-gray-400"
              }`}
            >
              2
            </span>
            Step 2: Preview & Confirm
          </div>
        </div>

        {!isFirstStepCompleted ? (
          <form onSubmit={handlePreviewStep} className="mt-4 space-y-4">
            <FieldGroup className="space-y-4">
              {/* Reason Selection */}
              <Field data-invalid={!!errors.reason}>
                <FieldLabel>Refund Reason</FieldLabel>
                <Select
                  disabled={isRefusedOrder}
                  items={availableReasons.map((r) => ({ value: r, label: REASON_LABELS[r] }))}
                  value={reason || null}
                  onValueChange={(val) => setReason((val as RefundReason) ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select refund reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReasons.map((r) => (
                      <SelectItem key={r} value={r}>
                        {REASON_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isRefusedOrder && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Reason automatically locked to Refused Delivery for refused orders.
                  </p>
                )}
                {errors.reason && <FieldError>{errors.reason}</FieldError>}
              </Field>

              {/* Note Box */}
              <Field>
                <FieldLabel htmlFor="refund-note">Note / Remarks (Optional)</FieldLabel>
                <Textarea
                  id="refund-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Add additional details regarding this refund case..."
                  className="resize-none focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
              </Field>

              {/* Items Information & Outcome */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <FieldLabel className="text-xs font-semibold text-foreground">
                      Items & Return Outcomes
                    </FieldLabel>
                    <p className="text-[11px] text-muted-foreground">
                      Select which items to refund and customize partial quantities.
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {selectedCount} of {order.items.length} selected
                  </span>
                </div>

                {errors.items && <p className="text-xs font-medium text-destructive">{errors.items}</p>}

                <div className="space-y-3">
                  {order.items.map((orderItem) => {
                    const currentInput = items.find((i) => i.order_item_id === orderItem.id);
                    if (!currentInput) return null;

                    const isChecked = currentInput.selected;

                    return (
                      <div
                        key={orderItem.id}
                        className={`rounded-lg border p-3.5 shadow-xs transition-all space-y-3 ${
                          isChecked
                            ? "bg-card/60 border-border"
                            : "bg-muted/10 border-dashed border-border/50 opacity-60 text-muted-foreground"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <Checkbox
                              id={`item-check-${orderItem.id}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleItemSelection(orderItem.id)}
                              className="cursor-pointer"
                            />
                            <label
                              htmlFor={`item-check-${orderItem.id}`}
                              className={`cursor-pointer select-none ${
                                isChecked ? "text-foreground" : "text-muted-foreground line-through decoration-muted-foreground/40"
                              }`}
                            >
                              <p className="text-xs font-semibold leading-tight">
                                {orderItem.product_name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {orderItem.volume_ml > 0 ? `${orderItem.volume_ml}ml` : "Standard Variant"}
                              </p>
                            </label>
                          </div>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                              isChecked ? "bg-gray-100 text-muted-foreground" : "bg-muted/30 text-muted-foreground/60"
                            }`}
                          >
                            Order Qty: {orderItem.quantity}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {/* Quantity (Editable when checked) */}
                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                              <span>Refund Quantity</span>
                              <span className="text-[10px] text-muted-foreground/80">Max: {orderItem.quantity}</span>
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={orderItem.quantity}
                              value={currentInput.quantity}
                              disabled={!isChecked}
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value, 10);
                                const newQty = isNaN(parsed)
                                  ? 1
                                  : Math.min(orderItem.quantity, Math.max(1, parsed));
                                handleItemChange(orderItem.id, "quantity", newQty);
                              }}
                              className={`h-9 text-xs font-medium ${
                                isChecked
                                  ? "bg-background focus-visible:border-primary-normal"
                                  : "bg-gray-100/50 cursor-not-allowed text-muted-foreground"
                              }`}
                            />
                          </div>

                          {/* Condition */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                              Condition
                            </label>
                            <Select
                              disabled={!isChecked}
                              items={CONDITION_OPTIONS}
                              value={currentInput.condition}
                              onValueChange={(val) =>
                                handleItemChange(orderItem.id, "condition", val as ItemCondition)
                              }
                            >
                              <SelectTrigger className="h-9 w-full text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CONDITION_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Disposition */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                              Disposition
                            </label>
                            <Select
                              disabled={!isChecked}
                              items={DISPOSITION_OPTIONS}
                              value={currentInput.disposition}
                              onValueChange={(val) =>
                                handleItemChange(orderItem.id, "disposition", val as ItemDisposition)
                              }
                            >
                              <SelectTrigger className="h-9 w-full text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DISPOSITION_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FieldGroup>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPreviewing}
                className="cursor-pointer rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="gap-1.5 cursor-pointer rounded-full bg-primary-normal text-black hover:bg-primary-hover"
                disabled={isPreviewing || selectedCount === 0}
              >
                {isPreviewing && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                Preview Refund Case
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="mt-4 space-y-5">
            {/* Step 1 Summary Card */}
            <div className="rounded-lg border bg-card p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Selected Reason & Notes</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFirstStepCompleted(false)}
                  className="h-7 gap-1 px-2 text-[11px] font-semibold text-primary-active hover:bg-primary-normal/10"
                >
                  <Icon icon="solar:pen-2-linear" className="size-3.5" />
                  Edit Details
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="font-semibold text-foreground">Reason:</span>
                <span className="rounded-md px-2 py-0.5 font-medium">
                  {reason ? REASON_LABELS[reason] : "Not selected"}
                </span>
              </div>
              {note && (
                <div className="text-xs text-muted-foreground bg-gray-100 p-2 rounded">
                  <span className="font-semibold">Note:</span> {note}
                </div>
              )}
            </div>

            {/* Preview Output Breakdown */}
            {previewData && (
              <div className="space-y-4">
                {!previewData.eligible && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 font-medium">
                    <Icon icon="solar:danger-triangle-linear" className="size-4 shrink-0" />
                    This order is flagged as non-eligible for standard refund processing.
                  </div>
                )}

                {/* Items Summary Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Refund Line Breakdown
                  </span>
                  <div className="space-y-2">
                    {previewData.items.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{item.product_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.variant_name ? item.variant_name : "Standard Variant"} · Qty: {item.quantity} × {formatOrderMoney(item.unit_price, previewData.currency)}
                          </p>
                          <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                            <span className="rounded px-1.5 py-0.5 bg-gray-100">Condition: {item.condition}</span>
                            <span className="rounded px-1.5 py-0.5 bg-gray-100">Disposition: {item.disposition}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">Line Refund</p>
                          <p className="font-semibold text-foreground">
                            {formatOrderMoney(item.line_refund, previewData.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Totals Card */}
                <div className="rounded-lg border p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Merchandise Refund</span>
                    <span className="font-medium text-foreground">
                      {formatOrderMoney(previewData.merchandise_refund, previewData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Refund</span>
                    <span className="font-medium text-foreground">
                      {formatOrderMoney(previewData.delivery_refund, previewData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cancellation / Restock Fee</span>
                    <span className="font-medium text-foreground">
                      {formatOrderMoney(previewData.cancellation_fee, previewData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                    <span>Final Refund Amount</span>
                    <span>
                      {formatOrderMoney(previewData.final_refund, previewData.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFirstStepCompleted(false)}
                disabled={isConfirming}
                className="cursor-pointer rounded-full"
              >
                Back to Details
              </Button>
              <Button
                type="submit"
                variant="destructive"
                onClick={handleConfirmStep}
                className="gap-1.5 cursor-pointer rounded-full"
                disabled={isConfirming}
              >
                {isConfirming && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                Confirm Refund Case
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

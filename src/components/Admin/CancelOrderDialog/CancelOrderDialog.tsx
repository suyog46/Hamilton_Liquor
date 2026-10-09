"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
  type CancelOrderReason,
  useConfirmCancellationMutation,
  usePreviewCancellationMutation,
} from "@/redux/features/order/orderApiSlice";

export interface CancellationRule {
  status: string;
  fulfillment_status: string;
  reasons: CancelOrderReason[];
}

export const CANCELLATION_RULES: CancellationRule[] = [
  {
    status: "CONFIRMED",
    fulfillment_status: "PENDING",
    reasons: ["CUSTOMER_CANCELLED", "STORE_CANCELLED", "ITEM_UNAVAILABLE", "OTHER"],
  },
  {
    status: "CONFIRMED",
    fulfillment_status: "PREPARING",
    reasons: ["CUSTOMER_CANCELLED", "STORE_CANCELLED", "ITEM_UNAVAILABLE", "OTHER"],
  },
  {
    status: "CONFIRMED",
    fulfillment_status: "READY_FOR_DELIVERY",
    reasons: ["CUSTOMER_CANCELLED", "STORE_CANCELLED", "ITEM_UNAVAILABLE", "OTHER"],
  },
  {
    status: "CONFIRMED",
    fulfillment_status: "OUT_FOR_DELIVERY",
    reasons: ["CUSTOMER_CANCELLED", "STORE_CANCELLED", "OTHER"],
  },
];

export function getCancelReasons(status?: string, fulfillmentStatus?: string): CancelOrderReason[] {
  if (!status || !fulfillmentStatus) return [];
  const matchedRule = CANCELLATION_RULES.find(
    (rule) =>
      rule.status.toUpperCase() === status.toUpperCase() &&
      rule.fulfillment_status.toUpperCase() === fulfillmentStatus.toUpperCase()
  );
  return matchedRule ? matchedRule.reasons : [];
}

export function isOrderCancellable(status?: string, fulfillmentStatus?: string): boolean {
  return getCancelReasons(status, fulfillmentStatus).length > 0;
}

const REASON_LABELS: Record<CancelOrderReason, string> = {
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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { error?: { message?: string }; message?: string } | undefined;
    return data?.error?.message ?? data?.message ?? fallback;
  }
  return fallback;
};

interface CancelOrderDialogProps {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelOrderDialog({ order, open, onOpenChange }: CancelOrderDialogProps) {
  const availableReasons = getCancelReasons(order.status, order.fulfillment_status);

  const [reason, setReason] = useState<CancelOrderReason | "">("");
  const [note, setNote] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isFirstStepCompleted, setIsFirstStepCompleted] = useState(false);
  const [previewData, setPreviewData] = useState<CancellationPreviewData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [previewCancellation, { isLoading: isPreviewing }] = usePreviewCancellationMutation();
  const [confirmCancellation, { isLoading: isConfirming }] = useConfirmCancellationMutation();

  useEffect(() => {
    if (open) {
      setReason(availableReasons[0] ?? "");
      setNote("");
      setIdempotencyKey(crypto.randomUUID());
      setIsFirstStepCompleted(false);
      setPreviewData(null);
      setErrors({});
    }
  }, [open, order, availableReasons]);

  const handlePreviewStep = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!reason) nextErrors.reason = "Please select a cancellation reason.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const res = await previewCancellation({
        order_id: order.id,
        body: {
          reason: reason as CancelOrderReason,
          note: note.trim() || undefined,
        },
      }).unwrap();

      setPreviewData(res.data);
      if (!idempotencyKey) {
        setIdempotencyKey(crypto.randomUUID());
      }
      setIsFirstStepCompleted(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate cancellation preview."));
    }
  };

  const handleConfirmStep = async () => {
    if (!reason) return;

    try {
      await confirmCancellation({
        order_id: order.id,
        body: {
          reason: reason as CancelOrderReason,
          note: note.trim() || undefined,
        },
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
      }).unwrap();

      toast.success("Order cancelled successfully.");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to confirm order cancellation."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Are you sure you want to cancel the order?</DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(-8).toUpperCase()} — {isFirstStepCompleted ? "Step 2: Preview Summary & Confirmation" : "Step 1: Reason & Notes"}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="mt-2 flex items-center justify-between rounded-lg border  p-2.5 text-xs">
          <div className={`flex items-center gap-2 font-medium ${!isFirstStepCompleted ? "text-primary-active font-semibold" : "text-muted-foreground"}`}>
            <span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${!isFirstStepCompleted ? "bg-primary-normal text-black font-bold" : "bg-emerald-600 text-white"}`}>
              {isFirstStepCompleted ? <Icon icon="solar:check-read-linear" className="size-3" /> : "1"}
            </span>
            Step 1: Reason & Note
          </div>
          <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground/60" />
          <div className={`flex items-center gap-2 font-medium ${isFirstStepCompleted ? "text-primary-active font-semibold" : "text-muted-foreground"}`}>
            <span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${isFirstStepCompleted ? "bg-primary-normal text-black font-bold" : "bg-muted text-gray-100"}`}>
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
                <FieldLabel>Cancellation Reason</FieldLabel>
                <Select
                  items={availableReasons.map((r) => ({ value: r, label: REASON_LABELS[r] }))}
                  value={reason || null}
                  onValueChange={(val) => setReason((val as CancelOrderReason) ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cancellation reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReasons.map((r) => (
                      <SelectItem key={r} value={r}>
                        {REASON_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reason && <FieldError>{errors.reason}</FieldError>}
              </Field>

              {/* Note Box */}
              <Field>
                <FieldLabel htmlFor="cancel-note">Note / Remarks (Optional)</FieldLabel>
                <Textarea
                  id="cancel-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Add additional details regarding this order cancellation..."
                  className="resize-none focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
              </Field>
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
                disabled={isPreviewing}
              >
                {isPreviewing && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                Preview Cancellation
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

              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="font-semibold text-foreground">Reason:</span>
                <span className="rounded-md  px-2 py-0.5 font-medium">
                  {reason ? REASON_LABELS[reason] : "Not selected"}
                </span>
              </div>
              {note && (
                <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
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
                    This order is flagged as non-eligible for standard cancellation.
                  </div>
                )}

                {/* Items Summary Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Cancellation Line Breakdown
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
                            <span className="rounded px-1.5 py-0.5">Condition: {item.condition}</span>
                            <span className="rounded px-1.5 py-0.5">Disposition: {item.disposition}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">Line Total</p>
                          <p className="font-semibold text-foreground">
                            {formatOrderMoney(item.line_refund, previewData.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Totals Card */}
                <div className="rounded-lg border  p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Merchandise Total</span>
                    <span className="font-medium text-foreground">
                      {formatOrderMoney(previewData.merchandise_refund, previewData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Adjustments</span>
                    <span className="font-medium text-foreground">
                      {formatOrderMoney(previewData.delivery_refund, previewData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cancellation Fee</span>
                    <span className="font-medium text-foreground">
                      {formatOrderMoney(previewData.cancellation_fee, previewData.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                    <span>Final Amount</span>
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
                variant="destructive"
                onClick={handleConfirmStep}
                className="gap-1.5 cursor-pointer rounded-full"
                disabled={isConfirming}
              >
                {isConfirming && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

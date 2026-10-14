"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatOrderMoney, formatOrderNumber } from "@/components/Order/orderDisplay";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type AdminOrder,
  type CancellationPreviewData,
  type ItemCondition,
  type ItemDisposition,
  type RefundCaseItemInput,
  type RefundReason,
  useCreateRefundCaseMutation,
  useGetRefundConfigurationQuery,
  usePreviewRefundCaseMutation,
} from "@/redux/features/order/orderApiSlice";

const REASON_LABELS: Record<string, string> = {
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

const CONDITION_LABELS: Record<string, string> = {
  NOT_APPLICABLE: "Not Applicable",
  UNOPENED: "Unopened",
  OPENED: "Opened",
  DAMAGED: "Damaged",
};

const DISPOSITION_LABELS: Record<string, string> = {
  NOT_RETURNED: "Not Returned",
  RESELLABLE: "Resellable",
  DAMAGED: "Damaged",
};

const formatReasonLabel = (val: string) =>
  REASON_LABELS[val] || val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatConditionLabel = (val: string) =>
  CONDITION_LABELS[val] || val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDispositionLabel = (val: string) =>
  DISPOSITION_LABELS[val] || val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { error?: { message?: string }; message?: string } | undefined;
    return data?.error?.message ?? data?.message ?? fallback;
  }
  return fallback;
};

interface RefundItemState {
  order_item_id: string;
  product_variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_price: string;
  original_quantity: number;
  claimed_quantity: number;
  remaining_refundable_quantity: number;
  selected: boolean;
  quantity: number;
  condition: string;
  disposition: string;
  ui_behavior: {
    selection_editable: boolean;
    quantity_editable: boolean;
    condition_editable: boolean;
    disposition_editable: boolean;
  };
}

interface CreateRefundDialogProps {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRefundDialog({ order, open, onOpenChange }: CreateRefundDialogProps) {
  const {
    data: configResponse,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    isError: isConfigError,
    refetch: refetchConfig,
  } = useGetRefundConfigurationQuery(order.id, { skip: !open });

  const config = configResponse?.data;
  const reasonOptions = useMemo(() => config?.reason_options ?? [], [config]);

  // Map reasons -> condition strings: ["reason value": ["condition values"]]
  const reasonsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const r of reasonOptions) {
      map[r.reason] = r.conditions.map((c) => c.condition);
    }
    return map;
  }, [reasonOptions]);

  const [reasonSelected, setReasonSelected] = useState<string>("");
  const [conditionDropdown, setConditionDropdown] = useState<string[]>([]);
  const [conditionValue, setConditionValue] = useState<string>("");
  const [dispositionDropdown, setDispositionDropdown] = useState<string[]>([]);
  const [dispositionValue, setDispositionValue] = useState<string>("");

  // Map conditions -> disposition strings under the selected reason
  const conditionMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    const currentReasonObj = reasonOptions.find((r) => r.reason === reasonSelected);
    if (currentReasonObj) {
      for (const c of currentReasonObj.conditions) {
        map[c.condition] = c.dispositions;
      }
    }
    return map;
  }, [reasonOptions, reasonSelected]);

  const [note, setNote] = useState("");
  const [items, setItems] = useState<RefundItemState[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isFirstStepCompleted, setIsFirstStepCompleted] = useState(false);
  const [previewData, setPreviewData] = useState<CancellationPreviewData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [previewRefundCase, { isLoading: isPreviewing }] = usePreviewRefundCaseMutation();
  const [createRefundCase, { isLoading: isConfirming }] = useCreateRefundCaseMutation();

  // Reset dialog state and populate items from configuration
  useEffect(() => {
    if (open && config) {
      const initialReason = config.reason_options[0]?.reason ?? "";
      setReasonSelected(initialReason);
      setNote("");
      setIdempotencyKey(crypto.randomUUID());
      setIsFirstStepCompleted(false);
      setPreviewData(null);
      setErrors({});

      setItems(
        config.items.map((item) => ({
          order_item_id: item.order_item_id,
          product_variant_id: item.product_variant_id,
          product_name: item.product_name,
          variant_name: item.variant_name,
          sku: item.sku,
          unit_price: item.unit_price,
          original_quantity: item.original_quantity,
          claimed_quantity: item.claimed_quantity,
          remaining_refundable_quantity: item.remaining_refundable_quantity,
          selected: Boolean(item.selectable),
          quantity:
            item.remaining_refundable_quantity > 0
              ? item.remaining_refundable_quantity
              : Math.max(1, item.original_quantity),
          condition: "",
          disposition: "",
          ui_behavior: item.ui_behavior ?? {
            selection_editable: true,
            quantity_editable: true,
            condition_editable: true,
            disposition_editable: true,
          },
        }))
      );
    }
  }, [open, config]);

  // When reasonSelected changes, cascade conditionDropdown and default conditionValue
  useEffect(() => {
    if (!reasonSelected) {
      setConditionDropdown([]);
      setConditionValue("");
      return;
    }
    const conditions = reasonsMap[reasonSelected] ?? [];
    setConditionDropdown(conditions);
    const chosenCondition = conditions[0] ?? "";
    setConditionValue(chosenCondition);
  }, [reasonSelected, reasonsMap]);

  // When conditionValue changes, cascade dispositionDropdown and default dispositionValue
  useEffect(() => {
    if (!conditionValue) {
      setDispositionDropdown([]);
      setDispositionValue("");
      return;
    }
    const dispositions = conditionMap[conditionValue] ?? [];
    setDispositionDropdown(dispositions);
    const chosenDisposition = dispositions[0] ?? "";
    setDispositionValue(chosenDisposition);
  }, [conditionValue, conditionMap]);

  // Sync conditionValue & dispositionValue into items
  useEffect(() => {
    if (!conditionValue || !dispositionValue) return;
    setItems((prev) =>
      prev.map((item) => {
        const nextCondition =
          item.condition && conditionMap[item.condition] !== undefined
            ? item.condition
            : conditionValue;
        const validDispositions = conditionMap[nextCondition] ?? [];
        const nextDisposition =
          validDispositions.includes(item.disposition)
            ? item.disposition
            : (validDispositions[0] ?? dispositionValue);

        return {
          ...item,
          condition: nextCondition,
          disposition: nextDisposition,
        };
      })
    );
  }, [conditionValue, dispositionValue, conditionMap]);

  const isReasonEditable = config?.ui_behavior?.reason_editable !== false;

  const toggleItemSelection = (orderItemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.order_item_id !== orderItemId) return item;
        if (!item.ui_behavior.selection_editable) return item;
        return { ...item, selected: !item.selected };
      })
    );
  };

  const handleItemQuantityChange = (orderItemId: string, nextQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.order_item_id !== orderItemId) return item;
        if (!item.ui_behavior.quantity_editable) return item;
        const max = item.remaining_refundable_quantity > 0 ? item.remaining_refundable_quantity : 1;
        const clamped = Math.min(max, Math.max(1, nextQty));
        return { ...item, quantity: clamped };
      })
    );
  };

  const handleItemConditionChange = (orderItemId: string, nextCond: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.order_item_id !== orderItemId) return item;
        if (!item.ui_behavior.condition_editable) return item;
        const validDispositions = conditionMap[nextCond] ?? [];
        return {
          ...item,
          condition: nextCond,
          disposition: validDispositions[0] ?? dispositionValue,
        };
      })
    );
  };

  const handleItemDispositionChange = (orderItemId: string, nextDisp: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.order_item_id !== orderItemId) return item;
        if (!item.ui_behavior.disposition_editable) return item;
        return { ...item, disposition: nextDisp };
      })
    );
  };

  const getSelectedItemsPayload = (): RefundCaseItemInput[] => {
    return items
      .filter((item) => item.selected)
      .map(({ order_item_id, quantity, condition, disposition }) => ({
        order_item_id,
        quantity,
        condition: (condition || conditionValue) as ItemCondition,
        disposition: (disposition || dispositionValue) as ItemDisposition,
      }));
  };

  const handlePreviewStep = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPayload = getSelectedItemsPayload();
    const nextErrors: Record<string, string> = {};

    if (!reasonSelected) nextErrors.reason = "Please select a refund reason.";
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
          reason: reasonSelected as RefundReason,
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
    if (!reasonSelected || selectedPayload.length === 0) return;

    try {
      await createRefundCase({
        order_id: order.id,
        body: {
          reason: reasonSelected as RefundReason,
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
            Order {formatOrderNumber(order)} —{" "}
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

        {isConfigLoading || (isConfigFetching && !config) ? (
          <div className="flex flex-col gap-2.5 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isConfigError || !config ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Icon icon="solar:danger-circle-linear" className="size-8 text-destructive" />
            <p className="text-xs text-muted-foreground">Failed to load refund configuration.</p>
            <Button size="sm" variant="secondary" onClick={() => refetchConfig()}>
              Try again
            </Button>
          </div>
        ) : !isFirstStepCompleted ? (
          <form onSubmit={handlePreviewStep} className="mt-4 space-y-4">
            <FieldGroup className="space-y-4">
              {/* Reason Selection */}
              <Field data-invalid={!!errors.reason}>
                <FieldLabel>Refund Reason</FieldLabel>
                <Select
                  disabled={!isReasonEditable}
                  items={reasonOptions.map((r) => ({
                    value: r.reason,
                    label: formatReasonLabel(r.reason),
                  }))}
                  value={reasonSelected || null}
                  onValueChange={(val) => setReasonSelected(val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select refund reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((r) => (
                      <SelectItem key={r.reason} value={r.reason}>
                        {formatReasonLabel(r.reason)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isReasonEditable && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Reason is locked by system configuration for this order state.
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
                      Select which items to refund and customize quantities, condition, and disposition.
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {selectedCount} of {items.length} selected
                  </span>
                </div>

                {errors.items && <p className="text-xs font-medium text-destructive">{errors.items}</p>}

                <div className="space-y-3">
                  {items.map((item) => {
                    const isChecked = item.selected;
                    const itemConditions = conditionDropdown;
                    const itemDispositions = conditionMap[item.condition] ?? dispositionDropdown;

                    const isSelectionDisabled = !item.ui_behavior.selection_editable;
                    const isQuantityDisabled = !isChecked || !item.ui_behavior.quantity_editable;
                    const isConditionDisabled =
                      !isChecked ||
                      !reasonSelected ||
                      !isReasonEditable ||
                      !item.ui_behavior.condition_editable;
                    const isDispositionDisabled =
                      !isChecked ||
                      !reasonSelected ||
                      !isReasonEditable ||
                      !item.ui_behavior.disposition_editable;

                    return (
                      <div
                        key={item.order_item_id}
                        className={`rounded-lg border p-3.5 shadow-xs transition-all space-y-3 ${
                          isChecked
                            ? "bg-card/60 border-border"
                            : "bg-gray-100/60 border-dashed border-border/50 opacity-60 text-muted-foreground"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <Checkbox
                              id={`item-check-${item.order_item_id}`}
                              checked={isChecked}
                              disabled={isSelectionDisabled}
                              onCheckedChange={() => toggleItemSelection(item.order_item_id)}
                              className="cursor-pointer"
                            />
                            <label
                              htmlFor={`item-check-${item.order_item_id}`}
                              className={`cursor-pointer select-none ${
                                isChecked
                                  ? "text-foreground"
                                  : "text-muted-foreground line-through decoration-muted-foreground/40"
                              }`}
                            >
                              <p className="text-xs font-semibold leading-tight">
                                {item.product_name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {item.variant_name || "Standard Variant"}
                                {item.sku ? ` · SKU: ${item.sku}` : ""}
                              </p>
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.claimed_quantity > 0 && (
                              <span className="rounded-md border bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                Claimed: {item.claimed_quantity}
                              </span>
                            )}
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                                isChecked
                                  ? "bg-gray-100 text-muted-foreground"
                                  : "bg-gray-100 text-muted-foreground/60"
                              }`}
                            >
                              Remaining: {item.remaining_refundable_quantity}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {/* Quantity (Editable when checked and editable flag) */}
                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                              <span>Refund Quantity</span>
                              <span className="text-[10px] text-muted-foreground/80">
                                Max: {item.remaining_refundable_quantity}
                              </span>
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={item.remaining_refundable_quantity}
                              value={item.quantity}
                              disabled={isQuantityDisabled}
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value, 10);
                                handleItemQuantityChange(item.order_item_id, isNaN(parsed) ? 1 : parsed);
                              }}
                              className={`h-9 text-xs font-medium ${
                                !isQuantityDisabled
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
                              disabled={isConditionDisabled}
                              items={itemConditions.map((c) => ({
                                value: c,
                                label: formatConditionLabel(c),
                              }))}
                              value={item.condition || null}
                              onValueChange={(val) =>
                                val && handleItemConditionChange(item.order_item_id, val)
                              }
                            >
                              <SelectTrigger className="h-9 w-full text-xs">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemConditions.map((cond) => (
                                  <SelectItem key={cond} value={cond}>
                                    {formatConditionLabel(cond)}
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
                              disabled={isDispositionDisabled}
                              items={itemDispositions.map((d) => ({
                                value: d,
                                label: formatDispositionLabel(d),
                              }))}
                              value={item.disposition || null}
                              onValueChange={(val) =>
                                val && handleItemDispositionChange(item.order_item_id, val)
                              }
                            >
                              <SelectTrigger className="h-9 w-full text-xs">
                                <SelectValue placeholder="Select disposition" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemDispositions.map((disp) => (
                                  <SelectItem key={disp} value={disp}>
                                    {formatDispositionLabel(disp)}
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
                  {reasonSelected ? formatReasonLabel(reasonSelected) : "Not selected"}
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
                            <span className="rounded px-1.5 py-0.5 bg-gray-100">Condition: {formatConditionLabel(item.condition)}</span>
                            <span className="rounded px-1.5 py-0.5 bg-gray-100">Disposition: {formatDispositionLabel(item.disposition)}</span>
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

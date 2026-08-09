"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { cn } from "@/lib/utils/index";
import {
  useAdjustInventoryMutation,
  type InventoryAdjustmentReason,
} from "@/redux/features/inventory/inventoryApiSlice";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const INCREASE_REASONS: { value: InventoryAdjustmentReason; label: string }[] = [
  { value: "PURCHASE", label: "Purchase (restock)" },
  { value: "RETURN", label: "Customer return" },
  { value: "INITIAL_STOCK", label: "Initial stock" },
  { value: "MANUAL", label: "Manual correction" },
];

const DECREASE_REASONS: { value: InventoryAdjustmentReason; label: string }[] = [
  { value: "SALE", label: "Sale" },
  { value: "DAMAGED", label: "Damaged / lost" },
  { value: "MANUAL", label: "Manual correction" },
];

interface AdjustInventoryDialogProps {
  productId: string;
  variantId: string;
  variantLabel: string;
  currentQuantity: number;
  trigger?: "icon" | "button";
  className?: string;
}

// Self-contained: owns its own trigger, open state, and form state, so it
// can be dropped into a product variant card or an inventory table cell
// without the parent needing to manage anything.
export function AdjustInventoryDialog({
  productId,
  variantId,
  variantLabel,
  currentQuantity,
  trigger = "button",
  className,
}: AdjustInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<InventoryAdjustmentReason | undefined>(undefined);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adjustInventory, { isLoading }] = useAdjustInventoryMutation();

  const reasonOptions = direction === "increase" ? INCREASE_REASONS : DECREASE_REASONS;

  const resetForm = () => {
    setDirection("increase");
    setAmount("");
    setReason(undefined);
    setNote("");
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleDirectionChange = (next: "increase" | "decrease") => {
    setDirection(next);
    setReason(undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const magnitude = Number(amount);
    const nextErrors: Record<string, string> = {};
    if (!amount || !(magnitude > 0)) nextErrors.amount = "Enter a quantity greater than 0.";
    if (!reason) nextErrors.reason = "Select a reason.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await adjustInventory({
        product_id: productId,
        product_variant_id: variantId,
        quantity_change: direction === "increase" ? magnitude : -magnitude,
        reason: reason!,
        note: note.trim() || undefined,
      }).unwrap();
      toast.success("Inventory adjusted successfully.");
      handleOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to adjust inventory."));
    }
  };

  return (
    <>
      {trigger === "icon" ? (
        <button
          type="button"
          aria-label="Adjust stock"
          onClick={() => setOpen(true)}
          className={cn(
            "text-muted-foreground transition-colors hover:text-primary-normal",
            className
          )}
        >
          <Icon icon="solar:pen-2-linear" className="h-4 w-4" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5 rounded-md", className)}
          onClick={() => setOpen(true)}
        >
          <Icon icon="solar:box-minimalistic-linear" className="h-4 w-4" />
          Adjust Stock
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Adjust Stock — {variantLabel}</DialogTitle>
              <DialogDescription>Current quantity: {currentQuantity}</DialogDescription>
            </DialogHeader>

            <FieldGroup className="mt-4">
              <Field orientation="horizontal">
                <Button
                  type="button"
                  variant={direction === "increase" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-1.5 rounded-md",
                    direction === "increase" && "bg-primary-normal text-black hover:bg-primary-hover"
                  )}
                  onClick={() => handleDirectionChange("increase")}
                >
                  <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
                  Increase
                </Button>
                <Button
                  type="button"
                  variant={direction === "decrease" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-1.5 rounded-md",
                    direction === "decrease" && "bg-destructive text-white hover:bg-destructive/90"
                  )}
                  onClick={() => handleDirectionChange("decrease")}
                >
                  <Icon icon="solar:minus-circle-linear" className="h-4 w-4" />
                  Decrease
                </Button>
              </Field>

              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor="adjust-amount">Quantity</FieldLabel>
                <Input
                  id="adjust-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 40"
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
                {errors.amount && <FieldError>{errors.amount}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.reason}>
                <FieldLabel>Reason</FieldLabel>
                <Select
                  items={reasonOptions}
                  value={reason}
                  onValueChange={(value) => setReason(value ?? undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reason && <FieldError>{errors.reason}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="adjust-note">Note (optional)</FieldLabel>
                <Textarea
                  id="adjust-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Add context for this adjustment"
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
                disabled={isLoading}
              >
                {isLoading && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                Save Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

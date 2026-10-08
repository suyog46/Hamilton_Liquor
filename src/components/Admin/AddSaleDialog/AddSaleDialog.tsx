"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import DateTimePicker from "@/components/Admin/DateTimePicker/DateTimePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useCreateSaleMutation } from "@/redux/features/sale/saleApiSlice";

interface AddSaleDialogProps {
  variantId: string;
  variantLabel: string;
}

const STORE_TIMEZONE = "America/New_York";

const getTodayMinDateTime = () => {
  return formatInTimeZone(new Date(), STORE_TIMEZONE, "yyyy-MM-dd'T'00:00");
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string; error?: { message?: string } } | undefined;
    return data?.message ?? data?.error?.message ?? fallback;
  }
  return fallback;
};

const toIsoString = (value: string) => {
  if (!value) return "";
  return fromZonedTime(value, STORE_TIMEZONE).toISOString();
};

const AddSaleDialog = ({ variantId, variantLabel }: AddSaleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createSale, { isLoading }] = useCreateSaleMutation();

  const minDateTime = getTodayMinDateTime();

  const reset = () => {
    setPercentage("");
    setStartedAt("");
    setEndedAt("");
    setErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const salePercentage = Number(percentage);
    const nextErrors: Record<string, string> = {};
    if (!percentage || !(salePercentage > 0)) nextErrors.percentage = "Enter a percentage greater than 0.";
    if (!startedAt) {
      nextErrors.startedAt = "Start date is required.";
    } else if (startedAt < minDateTime) {
      nextErrors.startedAt = "Start date cannot be before today.";
    }
    if (!endedAt) {
      nextErrors.endedAt = "End date is required.";
    } else if (startedAt && endedAt <= startedAt) {
      nextErrors.endedAt = "End date must be after start date.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await createSale({
        variant_id: variantId,
        percentage: salePercentage,
        started_at: toIsoString(startedAt),
        ended_at: toIsoString(endedAt),
      }).unwrap();
      toast.success("Sale created.");
      handleOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create sale."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 gap-1.5 rounded-md px-2 text-[11px]"
          />
        }
      >
        <Icon icon="solar:sale-linear" className="h-3.5 w-3.5" />
        Add sale
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add sale</DialogTitle>
            <DialogDescription>
              Create a timed sale for {variantLabel}.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-5">
            <Field data-invalid={!!errors.percentage}>
              <FieldLabel>Percentage</FieldLabel>
              <Input
                type="number"
                min={1}
                step="0.01"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
                placeholder="10"
                disabled={isLoading}
              />
              {errors.percentage && <FieldError>{errors.percentage}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.startedAt}>
              <FieldLabel>Start date</FieldLabel>
              <DateTimePicker
                value={startedAt}
                onChange={setStartedAt}
                min={minDateTime}
                disabled={isLoading}
                placeholder="Pick start date & time"
              />
              {errors.startedAt && <FieldError>{errors.startedAt}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.endedAt}>
              <FieldLabel>End date</FieldLabel>
              <DateTimePicker
                value={endedAt}
                onChange={setEndedAt}
                min={startedAt || minDateTime}
                disabled={isLoading}
                placeholder="Pick end date & time"
              />
              {errors.endedAt && <FieldError>{errors.endedAt}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary-normal text-black hover:bg-primary-hover"
              disabled={isLoading}
            >
              {isLoading && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
              Create sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSaleDialog;

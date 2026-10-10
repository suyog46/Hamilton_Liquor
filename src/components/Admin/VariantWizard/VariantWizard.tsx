import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import MultiMediaUpload from "@/components/Admin/MultiMediaUpload/MultiMediaUpload";
import type { MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";

export interface VariantWizardValues {
  sku: string;
  display_name: string;
  is_liquor: boolean;
  volume_ml: string;
  price: string;
  alcohol_percentage: string;
  quantity: string;
  is_active: boolean;
  media: MediaValue[];
}

interface VariantWizardProps {
  mode: "create" | "update";
  initialValues?: Partial<VariantWizardValues>;
  onSubmit: (values: VariantWizardValues) => void;
  isSubmitting?: boolean;
}

const emptyValues = (): VariantWizardValues => ({
  sku: "",
  display_name: "",
  is_liquor: true,
  volume_ml: "",
  price: "",
  alcohol_percentage: "",
  quantity: "",
  is_active: true,
  media: [],
});

const VariantWizard = ({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: VariantWizardProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<VariantWizardValues>({
    ...emptyValues(),
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = (next: Partial<VariantWizardValues>) => {
    setValues((prev) => ({ ...prev, ...next }));
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(next).forEach((key) => delete copy[key]);
      return copy;
    });
  };

  const validateStep1 = () => {
    const volume = Number(values.volume_ml);
    const price = Number(values.price);
    const alcohol = Number(values.alcohol_percentage);
    const quantity = Number(values.quantity);

    const nextErrors: Record<string, string> = {};

    if (!values.sku || !values.sku.trim()) {
      nextErrors.sku = "SKU is required.";
    }
    if (!values.display_name || !values.display_name.trim()) {
      nextErrors.displayName = "Display name is required.";
    }
    if (values.is_liquor) {
      if (!values.volume_ml || Number.isNaN(volume) || volume <= 0) {
        nextErrors.volume = "Enter a volume greater than 0.";
      }
      if (
        values.alcohol_percentage === "" ||
        values.alcohol_percentage === undefined ||
        values.alcohol_percentage === null ||
        Number.isNaN(alcohol) ||
        alcohol < 0 ||
        alcohol > 100
      ) {
        nextErrors.alcohol = "Enter an alcohol percentage between 0 and 100.";
      }
    }
    if (
      values.price === "" ||
      values.price === undefined ||
      values.price === null ||
      Number.isNaN(price) ||
      price <= 0
    ) {
      nextErrors.price = "Enter a price greater than 0.";
    }
    if (mode === "create") {
      if (
        values.quantity === "" ||
        values.quantity === undefined ||
        values.quantity === null ||
        Number.isNaN(quantity) ||
        quantity < 0
      ) {
        nextErrors.quantity = "Enter a valid quantity (0 or more).";
      }
    }

    setErrors(nextErrors);

    const errorList = Object.values(nextErrors);
    if (errorList.length > 0) {
      toast.error(`Validation error: ${errorList[0]}`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePublish = () => {
    const nextErrors: Record<string, string> = {};
    if (values.media.length === 0) {
      nextErrors.media = "Upload at least one image.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please upload at least one image before saving.");
      return;
    }
    onSubmit(values);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-200 ">
        <CardTitle className="flex items-center gap-3 text-sm">
          <span
            className={
              step === 1
                ? "text-primary-normal"
                : "text-gray-500"
            }
          >
            1. Details
          </span>
          <Icon icon="solar:alt-arrow-right-linear" className="h-3.5 w-3.5 text-gray-400" />
          <span className={step === 2 ? "text-primary-normal" : "text-gray-500"}>2. Images</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <div className="flex min-h-120 flex-col">
            <div className="flex py-8">
              <FieldGroup className=" w-full gap-6">


                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field data-invalid={!!errors.sku}>
                    <FieldLabel>SKU</FieldLabel>
                    <Input
                      type="text"
                      className="h-10 text-sm"
                      value={values.sku}
                      onChange={(e) => patch({ sku: e.target.value })}
                      placeholder="WINE-750-001"
                    />
                    {errors.sku && <FieldError>{errors.sku}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.displayName}>
                    <FieldLabel>Display name</FieldLabel>
                    <Input
                      type="text"
                      className="h-10 text-sm"
                      value={values.display_name}
                      onChange={(e) => patch({ display_name: e.target.value })}
                      placeholder="750 mL Bottle"
                    />
                    {errors.displayName && <FieldError>{errors.displayName}</FieldError>}
                  </Field>
                  <div className="col-span-full">
                    <Field orientation="horizontal" className="flex items-center gap-3">
                      <Checkbox
                        id="variant-is-liquor"
                        checked={values.is_liquor}
                        onCheckedChange={(checked) =>
                          patch({ is_liquor: checked === true })
                        }
                        className="data-checked:bg-primary-normal data-checked:border-primary-normal data-checked:text-white"
                      />
                      <FieldLabel htmlFor="variant-is-liquor" className="font-semibold text-gray-950 cursor-pointer">
                        Contains Volumle/ml or Alcohol
                      </FieldLabel>
                    </Field>
                  </div>

                  <Field data-invalid={values.is_liquor && !!errors.volume}>
                    <FieldLabel className={!values.is_liquor ? "opacity-50" : undefined}>
                      Volume (mL)
                    </FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      disabled={!values.is_liquor}
                      className="h-10 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      value={values.volume_ml}
                      onChange={(e) => patch({ volume_ml: e.target.value })}
                      placeholder={values.is_liquor ? "750" : "N/A"}
                    />
                    {values.is_liquor && errors.volume && (
                      <FieldError>{errors.volume}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={values.is_liquor && !!errors.alcohol}>
                    <FieldLabel className={!values.is_liquor ? "opacity-50" : undefined}>
                      Alcohol %
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      disabled={!values.is_liquor}
                      className="h-10 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      value={values.alcohol_percentage}
                      onChange={(e) => patch({ alcohol_percentage: e.target.value })}
                      placeholder={values.is_liquor ? "40" : "N/A"}
                    />
                    {values.is_liquor && errors.alcohol && (
                      <FieldError>{errors.alcohol}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={!!errors.price}>
                    <FieldLabel>Price ($)</FieldLabel>
                    <Input
                      type="number"
                      min={0.01}
                      step="0.01"
                      className="h-10 text-sm"
                      value={values.price}
                      onChange={(e) => patch({ price: e.target.value })}
                      placeholder="29.99"
                    />
                    {errors.price && <FieldError>{errors.price}</FieldError>}
                  </Field>

                  <Field data-invalid={mode === "create" && !!errors.quantity}>
                    <FieldLabel className={mode === "update" ? "opacity-50" : undefined}>
                      Quantity {mode === "update" && "(Managed via Inventory Adjustments)"}
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      disabled={mode === "update"}
                      className="h-10 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      value={values.quantity}
                      onChange={(e) => patch({ quantity: e.target.value })}
                      placeholder="0"
                    />
                    {mode === "create" && errors.quantity && <FieldError>{errors.quantity}</FieldError>}
                  </Field>
                </div>

                {mode === "update" && (
                  <Field orientation="horizontal" className="flex items-center gap-3">
                    <Checkbox
                      id="variant-active"
                      checked={values.is_active}
                      onCheckedChange={(checked) => patch({ is_active: checked === true })}
                      className="data-checked:bg-primary-normal data-checked:border-primary-normal data-checked:text-white"
                    />
                    <FieldLabel htmlFor="variant-active" className="font-normal cursor-pointer">
                      Active
                    </FieldLabel>
                  </Field>
                )}
              </FieldGroup>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover" onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-120 flex-col">
            <FieldGroup className="flex-1 overflow-y-auto pr-1">
              <Field data-invalid={!!errors.media}>
                <FieldLabel>Images</FieldLabel>
                <MultiMediaUpload value={values.media} onChange={(media) => patch({ media })} disabled={isSubmitting} />
                {errors.media && <FieldError>{errors.media}</FieldError>}
              </Field>
            </FieldGroup>

            <div className="flex justify-between pt-3">
              <Button type="button" variant="secondary" className="gap-1.5" onClick={() => setStep(1)} disabled={isSubmitting}>
                Previous
              </Button>
              <Button
                type="button"
                className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {mode === "create" ? "Publish" : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantWizard;

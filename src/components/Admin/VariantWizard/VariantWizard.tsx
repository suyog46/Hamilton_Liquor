"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import MultiMediaUpload from "@/components/Admin/MultiMediaUpload/MultiMediaUpload";
import type { MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";

export interface VariantWizardValues {
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
  volume_ml: "",
  price: "",
  alcohol_percentage: "",
  quantity: "",
  is_active: true,
  media: [],
});

const VariantWizard = ({ mode, initialValues, onSubmit, isSubmitting = false }: VariantWizardProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<VariantWizardValues>({ ...emptyValues(), ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = (next: Partial<VariantWizardValues>) => setValues((prev) => ({ ...prev, ...next }));

  const validateStep1 = () => {
    const volume = Number(values.volume_ml);
    const price = Number(values.price);
    const alcohol = Number(values.alcohol_percentage);
    const quantity = Number(values.quantity);

    const nextErrors: Record<string, string> = {};
    if (!values.volume_ml || !(volume > 0)) nextErrors.volume = "Enter a volume greater than 0.";
    if (!values.price || !(price > 0)) nextErrors.price = "Enter a price greater than 0.";
    if (values.alcohol_percentage === "" || alcohol < 0 || alcohol > 100)
      nextErrors.alcohol = "Enter a value between 0 and 100.";
    if (values.quantity === "" || quantity < 0) nextErrors.quantity = "Enter a valid quantity.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handlePublish = () => {
    const nextErrors: Record<string, string> = {};
    if (values.media.length === 0) nextErrors.media = "Upload at least one image.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={
              step === 1
                ? "text-primary-normal"
                : "text-muted-foreground"
            }
          >
            1. Details
          </span>
          <Icon icon="solar:alt-arrow-right-linear" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={step === 2 ? "text-primary-normal" : "text-muted-foreground"}>2. Images</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <div className="flex h-120 flex-col">
            <FieldGroup className="flex flex-1 flex-col justify-start gap-6 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <Field data-invalid={!!errors.volume}>
                  <FieldLabel>Volume (mL)</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    className="h-10 text-sm"
                    value={values.volume_ml}
                    onChange={(e) => patch({ volume_ml: e.target.value })}
                    placeholder="750"
                  />
                  {errors.volume && <FieldError>{errors.volume}</FieldError>}
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

                <Field data-invalid={!!errors.alcohol}>
                  <FieldLabel>Alcohol %</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    className="h-10 text-sm"
                    value={values.alcohol_percentage}
                    onChange={(e) => patch({ alcohol_percentage: e.target.value })}
                    placeholder="40"
                  />
                  {errors.alcohol && <FieldError>{errors.alcohol}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.quantity}>
                  <FieldLabel>Quantity</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    className="h-10 text-sm"
                    value={values.quantity}
                    onChange={(e) => patch({ quantity: e.target.value })}
                    placeholder="0"
                  />
                  {errors.quantity && <FieldError>{errors.quantity}</FieldError>}
                </Field>
              </div>

              {mode === "update" && (
                <Field orientation="horizontal">
                  <Checkbox
                    id="variant-active"
                    checked={values.is_active}
                    onCheckedChange={(checked) => patch({ is_active: checked === true })}
                  />
                  <FieldLabel htmlFor="variant-active" className="font-normal">
                    Active
                  </FieldLabel>
                </Field>
              )}
            </FieldGroup>

            <div className="flex justify-end pt-3">
              <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover" onClick={handleNext}>
                Next
                <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-120 flex-col">
            <FieldGroup className="flex-1 overflow-y-auto pr-1">
              <Field data-invalid={!!errors.media}>
                <FieldLabel>Images</FieldLabel>
                <MultiMediaUpload value={values.media} onChange={(media) => patch({ media })} disabled={isSubmitting} />
                {errors.media && <FieldError>{errors.media}</FieldError>}
              </Field>
            </FieldGroup>

            <div className="flex justify-between pt-3">
              <Button type="button" variant="secondary" className="gap-1.5" onClick={() => setStep(1)} disabled={isSubmitting}>
                <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {isSubmitting && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
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

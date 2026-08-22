"use client";

import { useRef } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";
import { useUploadMediaMutation } from "@/redux/features/media/mediaApiSlice";

export interface MediaValue {
  id: string;
  url: string;
}

interface MediaUploadProps {
  value: MediaValue | null;
  onChange: (media: MediaValue) => void;
  disabled?: boolean;
  className?: string;
}

const MediaUpload = ({ value, onChange, disabled, className }: MediaUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadMedia, { isLoading }] = useUploadMediaMutation();

  const openPicker = () => {
    if (disabled || isLoading) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const res = await uploadMedia(file).unwrap();
      onChange(res.data);
    } catch {
      toast.error("Failed to upload image.");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || isLoading}
        className={cn(
          "relative flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-input bg-gray-100/20 transition-colors sm:h-64",
          "disabled:cursor-not-allowed disabled:opacity-60",
          !disabled && !isLoading && "hover:border-primary-normal hover:bg-brand-hover"
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icon icon="svg-spinners:180-ring" className="h-6 w-6" />
            <p className="text-xs">Uploading…</p>
          </div>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="Uploaded media" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icon icon="solar:gallery-add-linear" className="h-8 w-8" />
            <p className="text-xs font-medium">Click to upload an image</p>
            <p className="text-[11px]">PNG or JPG</p>
          </div>
        )}
      </button>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">PNG or JPG, shown as the product image.</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5 rounded-md"
          onClick={openPicker}
          disabled={disabled || isLoading}
        >
          <Icon icon="solar:gallery-edit-linear" className="h-4 w-4" />
          {value ? "Replace image" : "Upload image"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default MediaUpload;

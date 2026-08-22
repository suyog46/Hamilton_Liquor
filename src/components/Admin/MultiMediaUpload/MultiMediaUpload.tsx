"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/index";
import { useUploadMediaMutation } from "@/redux/features/media/mediaApiSlice";
import type { MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";

interface MultiMediaUploadProps {
  value: MediaValue[];
  onChange: (media: MediaValue[]) => void;
  disabled?: boolean;
  className?: string;
}

// Same upload mechanics as MediaUpload, but for a variant's full image
// gallery — multiple files, each shown as a removable, draggable preview
// tile. display_order is implied by array position, so reordering the
// tiles is what actually changes the order sent to the API.
const MultiMediaUpload = ({ value, onChange, disabled, className }: MultiMediaUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadMedia, { isLoading }] = useUploadMediaMutation();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const openPicker = () => {
    if (disabled || isLoading) return;
    inputRef.current?.click();
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(files.map((file) => uploadMedia(file).unwrap()));
      onChange([...value, ...uploaded.map((res) => res.data)]);
    } catch {
      toast.error("Failed to upload one or more images.");
    }
  };

  const removeAt = (id: string) => onChange(value.filter((media) => media.id !== id));

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (disabled || dragIndex === null) return;
    setOverIndex(index);
  };

  const handleDragEnd = () => {
    if (!disabled && dragIndex !== null && overIndex !== null) {
      reorder(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((media, index) => (
          <div
            key={media.id}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
            onDrop={(e) => e.preventDefault()}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border border-input bg-gray-100 transition-shadow",
              !disabled && "cursor-grab active:cursor-grabbing",
              dragIndex === index && "opacity-40",
              overIndex === index && dragIndex !== index && "ring-2 ring-primary-normal"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.url} alt="" className="h-full w-full object-cover" draggable={false} />
            <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-semibold text-white">
              {index + 1}
            </span>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => removeAt(media.id)}
              disabled={disabled}
              className="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-destructive disabled:cursor-not-allowed"
            >
              <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || isLoading}
          className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input bg-gray-100/20 text-muted-foreground transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-60",
            !disabled && !isLoading && "hover:border-primary-normal hover:bg-brand-hover"
          )}
        >
          {isLoading ? (
            <Icon icon="svg-spinners:180-ring" className="h-6 w-6" />
          ) : (
            <>
              <Icon icon="solar:gallery-add-linear" className="h-6 w-6" />
              <span className="text-[11px] font-medium">Add image{value.length > 0 ? "s" : ""}</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        PNG or JPG. Drag images to reorder — the number shows display order, and image 1 is used as the cover
        across the storefront.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesChange}
      />
    </div>
  );
};

export default MultiMediaUpload;

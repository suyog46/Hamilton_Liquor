"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import MediaUpload, { type MediaValue } from "@/components/Admin/MediaUpload/MediaUpload";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandsQuery,
  useUpdateBrandMutation,
  type Brand,
} from "@/redux/features/brand/brandApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const AdminBrandsPage = () => {
  const { data, isLoading, isError } = useGetBrandsQuery();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaValue | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const brands = data?.data.items ?? [];
  const isSaving = isCreating || isUpdating;

  const openCreateDialog = () => {
    setEditingBrand(null);
    setName("");
    setDescription("");
    setNameError(null);
    setMedia(null);
    setDialogOpen(true);
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setDescription(brand.description);
    setNameError(null);
    setMedia(brand.media);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Brand name is required.");
      return;
    }

    setNameError(null);
    const trimmedDescription = description.trim();

    try {
      if (editingBrand) {
        await updateBrand({
          brand_id: editingBrand.id,
          name: trimmedName,
          description: trimmedDescription,
          media_id: media?.id,
        }).unwrap();
        toast.success("Brand updated successfully.");
      } else {
        await createBrand({
          name: trimmedName,
          description: trimmedDescription,
          media_id: media?.id,
        }).unwrap();
        toast.success("Brand created successfully.");
      }
      setDialogOpen(false);
    } catch (err) {
      const message = getErrorMessage(
        err,
        editingBrand ? "Failed to update brand." : "Failed to create brand."
      );
      setNameError(message);
      toast.error(message);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Delete "${brand.name}"? This cannot be undone.`)) return;

    setDeletingId(brand.id);
    try {
      await deleteBrand(brand.id).unwrap();
      toast.success("Brand deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete brand."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Brands"
        description="Manage the brands available across your product catalog."
        action={
          <Button
            type="button"
            className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
            onClick={openCreateDialog}
          >
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Brand
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
            <p className="text-xs text-muted-foreground">Failed to load brands.</p>
          </CardContent>
        </Card>
      ) : brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:tag-linear" className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No brands yet. Add your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="flex-row items-start gap-3 p-3 transition-colors hover:border-brand-hover-border hover:bg-brand-hover"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-sm font-semibold uppercase text-muted-foreground">
                {brand.media?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.media.url}
                    alt={brand.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  brand.name.slice(0, 2)
                )}
              </div>
              <CardContent className="flex-1 px-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{brand.name}</p>
                      <Badge variant={brand.is_active ? "secondary" : "outline"}>
                        {brand.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">/{brand.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit brand"
                      className="hover:bg-brand-hover hover:text-primary-normal"
                      onClick={() => openEditDialog(brand)}
                    >
                      <Icon icon="solar:pen-linear" className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete brand"
                      className="hover:bg-destructive/10"
                      disabled={isDeleting && deletingId === brand.id}
                      onClick={() => handleDelete(brand)}
                    >
                      {isDeleting && deletingId === brand.id ? (
                        <Icon icon="svg-spinners:180-ring" className="h-4 w-4 text-destructive" />
                      ) : (
                        <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
                {brand.description && (
                  <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {brand.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
              <DialogDescription>
                {editingBrand
                  ? "Update this brand's details."
                  : "Create a new brand for your product catalog."}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="mt-4">
              <Field data-invalid={!!nameError}>
                <FieldLabel htmlFor="brand-name">Brand name</FieldLabel>
                <Input
                  id="brand-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jack Daniel's"
                  autoFocus
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
                {nameError && <FieldError>{nameError}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="brand-description">Description</FieldLabel>
                <Textarea
                  id="brand-description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this brand"
                  rows={3}
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
              </Field>

              <Field>
                <FieldLabel>Image (optional)</FieldLabel>
                <MediaUpload value={media} onChange={setMedia} disabled={isSaving} />
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
                disabled={isSaving}
              >
                {isSaving && <Icon icon="svg-spinners:180-ring" className="h-4 w-4" />}
                {editingBrand ? "Save Changes" : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBrandsPage;

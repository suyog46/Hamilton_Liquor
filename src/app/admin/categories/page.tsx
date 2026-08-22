"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  type Category,
} from "@/redux/features/category/categoryApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const AdminCategoriesPage = () => {
  const { data, isLoading, isError } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaValue | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<Category | null>(null);

  const categories = data?.data.items ?? [];
  const isSaving = isCreating || isUpdating;

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setNameError(null);
    setMedia(null);
    setMediaError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setNameError(null);
    setMedia(category.media);
    setMediaError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    let hasError = false;

    if (!trimmedName) {
      setNameError("Category name is required.");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!media) {
      setMediaError("Category image is required.");
      hasError = true;
    } else {
      setMediaError(null);
    }

    if (hasError) return;

    try {
      if (editingCategory) {
        await updateCategory({
          category_id: editingCategory.id,
          name: trimmedName,
          media_id: media!.id,
        }).unwrap();
        toast.success("Category updated successfully.");
      } else {
        await createCategory({ name: trimmedName, media_id: media!.id }).unwrap();
        toast.success("Category created successfully.");
      }
      setDialogOpen(false);
    } catch (err) {
      const message = getErrorMessage(
        err,
        editingCategory ? "Failed to update category." : "Failed to create category."
      );
      setNameError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!categoryPendingDelete) return;
    const category = categoryPendingDelete;

    setDeletingId(category.id);
    try {
      await deleteCategory(category.id).unwrap();
      toast.success("Category deleted.");
      setCategoryPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete category."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Categories"
        description="Manage the top-level shop categories and their subcategories."
        action={
          <Button
            type="button"
            className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
            onClick={openCreateDialog}
          >
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Category
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
            <p className="text-xs text-muted-foreground">Failed to load categories.</p>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:folder-linear" className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No categories yet. Add your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="flex-row items-center gap-3 p-3 transition-colors hover:border-brand-hover-border hover:bg-brand-hover"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-sm font-semibold uppercase text-muted-foreground">
                {category.media?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.media.url}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  category.name.slice(0, 2)
                )}
              </div>
              <CardContent className="flex-1 px-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{category.name}</p>
                      <Badge variant={category.is_active ? "success" : "outline"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">/{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Edit category"
                      onClick={() => openEditDialog(category)}
                      className="cursor-pointer text-muted-foreground transition-colors hover:text-primary-normal"
                    >
                      <Icon icon="solar:pen-linear" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete category"
                      disabled={isDeleting && deletingId === category.id}
                      onClick={() => setCategoryPendingDelete(category)}
                      className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting && deletingId === category.id ? (
                        <Icon icon="svg-spinners:180-ring" className="h-4 w-4 text-destructive" />
                      ) : (
                        <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update the name of this category."
                  : "Create a new top-level shop category."}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="mt-4">
              <Field data-invalid={!!nameError}>
                <FieldLabel htmlFor="category-name">Category name</FieldLabel>
                <Input
                  id="category-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wine"
                  autoFocus
                  className="focus-visible:border-primary-normal focus-visible:ring-primary-normal/40"
                />
                {nameError && <FieldError>{nameError}</FieldError>}
              </Field>

              <Field data-invalid={!!mediaError}>
                <FieldLabel>Image</FieldLabel>
                <MediaUpload value={media} onChange={setMedia} disabled={isSaving} />
                {mediaError && <FieldError>{mediaError}</FieldError>}
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
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
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!categoryPendingDelete}
        onOpenChange={(open) => !open && setCategoryPendingDelete(null)}
        title={`Delete "${categoryPendingDelete?.name}"?`}
        description="This cannot be undone."
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminCategoriesPage;

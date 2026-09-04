"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type SocialPlatform,
  useCreateSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useGetSocialLinksQuery,
  useUpdateSocialLinkMutation,
} from "@/redux/features/store/storeApiSlice";

const platforms: Array<{ value: SocialPlatform; label: string }> = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "X", label: "X" },
];

const getErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "Unable to update social links.";
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ?? data?.message ?? "Unable to update social links."
  );
};

export default function AdminSocialLinksPage() {
  const { data, isLoading, isError, refetch } = useGetSocialLinksQuery();
  const [createLink, { isLoading: isCreating }] = useCreateSocialLinkMutation();
  const [updateLink, { isLoading: isUpdating }] = useUpdateSocialLinkMutation();
  const [deleteLink, { isLoading: isDeleting }] = useDeleteSocialLinkMutation();
  const [platform, setPlatform] = useState<SocialPlatform>("FACEBOOK");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const links = data?.data ?? [];
  const usedPlatforms = useMemo(
    () => new Set(links.map((link) => link.platform)),
    [links],
  );
  const availablePlatforms = platforms.filter(
    ({ value }) => !usedPlatforms.has(value),
  );

  useEffect(() => {
    if (
      availablePlatforms.length > 0 &&
      !availablePlatforms.some(({ value }) => value === platform)
    ) {
      setPlatform(availablePlatforms[0].value);
    }
  }, [availablePlatforms, platform]);

  const addLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return toast.error("Enter a social link URL.");
    try {
      await createLink({ platform, url: url.trim() }).unwrap();
      setUrl("");
      toast.success("Social link added.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const saveLink = async (id: string) => {
    if (!editingUrl.trim()) return toast.error("Enter a social link URL.");
    try {
      await updateLink({ social_link_id: id, url: editingUrl.trim() }).unwrap();
      setEditingId(null);
      toast.success("Social link updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const removeLink = async (id: string) => {
    try {
      await deleteLink(id).unwrap();
      toast.success("Social link removed.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError)
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="size-7 text-destructive"
          />
          <p className="text-sm font-semibold">Unable to load social links.</p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Social Links"
        description="Manage the social profiles shown on your storefront."
      />
      <Card>
        <CardHeader>
          <CardTitle>Add social profile</CardTitle>
        </CardHeader>
        <CardContent>
          {availablePlatforms.length ? (
            <form
              onSubmit={addLink}
              className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-end"
            >
              <div className="flex flex-col gap-1.5">
                <Label>Platform</Label>
                <Select
                  items={availablePlatforms}
                  value={platform}
                  onValueChange={(value) => value && setPlatform(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-social-url">Profile URL</Label>
                <Input
                  id="new-social-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://…"
                />
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Icon icon="svg-spinners:180-ring" className="size-4" />
                ) : (
                  <Icon icon="solar:add-circle-linear" className="size-4" />
                )}
                Add link
              </Button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              All supported platforms have been added.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Connected profiles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {links.length ? (
            links.map((link) => {
              const label =
                platforms.find((item) => item.value === link.platform)?.label ??
                link.platform;
              return (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-end"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <Label htmlFor={`social-${link.id}`}>{label}</Label>
                    <Input
                      id={`social-${link.id}`}
                      value={editingId === link.id ? editingUrl : link.url}
                      readOnly={editingId !== link.id}
                      onChange={(event) => setEditingUrl(event.target.value)}
                    />
                  </div>
                  {editingId === link.id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveLink(link.id)}
                        disabled={isUpdating}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(link.id);
                          setEditingUrl(link.url);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeLink(link.id)}
                        disabled={isDeleting}
                      >
                        {" "}
                        <Icon
                          icon="solar:trash-bin-minimalistic-linear"
                          className="size-3.5"
                        />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground">
              No social profiles have been added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/utils";
import { apiSlice } from "@/redux/apiSlice";
import { useAppDispatch } from "@/redux/hooks";
import {
  useDeleteMeMutation,
  useGetMeQuery,
} from "@/redux/features/user/userApiSlice";
import { useLogoutMutation } from "@/redux/features/auth/authApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const AdminSettingsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: meData } = useGetMeQuery();
  const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation();
  const [logout] = useLogoutMutation();
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const deleteAccount = async () => {
    try {
      await deleteMe().unwrap();
      await logout()
        .unwrap()
        .catch(() => undefined);
      dispatch(apiSlice.util.resetApiState());
      toast.success("Account deleted.");
      router.replace("/");
    } catch (error) {
      const data = isFetchBaseQueryError(error)
        ? (error.data as
            | { message?: string; error?: { message?: string } }
            | undefined)
        : undefined;
      toast.error(
        data?.error?.message ??
          data?.message ??
          "Could not delete the account.",
      );
    } finally {
      setIsDeleteConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Settings"
        description="Store information, payments, and admin access."
        action={
          <Button
            type="button"
            className="gap-1.5 bg-primary-normal text-black hover:opacity-90"
          >
            <Icon icon="solar:diskette-linear" className="h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue={siteConfig.name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-phone">Phone</Label>
            <Input id="store-phone" defaultValue={siteConfig.phone} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="store-address">Address</Label>
            <Input id="store-address" defaultValue={siteConfig.address.full} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-email">Contact Email</Label>
            <Input id="store-email" defaultValue={siteConfig.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-social">Social Links</Label>
            <Input id="store-social" placeholder="Facebook, Instagram URLs" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Delete account</p>
            <p className="text-[11px] text-muted-foreground">
              Permanently remove {meData?.data?.email ?? "this account"} and its
              data.
            </p>
          </div>
          {isDeleteConfirming ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={deleteAccount}
              >
                {isDeleting ? "Deleting…" : "Confirm delete"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDeleteConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteConfirming(true)}
            >
              Delete account
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Processor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:card-linear"
                className="h-4 w-4 text-primary-normal"
              />
              <span className="font-medium">SpotOn</span>
            </div>
            <Badge variant="outline">Pending Verification</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Online checkout integration is pending confirmation of SpotOn API
            access and card-not-present support for alcohol e-commerce. A backup
            processor will be configured if needed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Store Admin</p>
              <p className="text-[11px] text-muted-foreground">
                admin@hamiltonliquorstore.com
              </p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
          <Button type="button" variant="secondary" className="w-fit gap-1.5">
            <Icon icon="solar:user-plus-linear" className="h-4 w-4" />
            Invite Staff Member
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;

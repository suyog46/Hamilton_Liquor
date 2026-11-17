"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useChangePasswordMutation } from "@/redux/features/user/userApiSlice";
import { useLogoutMutation } from "@/redux/features/auth/authApiSlice";
import { apiSlice } from "@/redux/apiSlice";
import { useAppDispatch } from "@/redux/hooks";

const getErrorMessage = (error: unknown): string => {
  if (!isFetchBaseQueryError(error)) return "Could not change your password.";
  const data = error.data as
    | { message?: string; detail?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ??
    data?.message ??
    data?.detail ??
    "Could not change your password. Please verify your current password."
  );
};

export default function ChangePasswordSection() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const isSubmitting = isChanging || isLoggingOut;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();

      toast.success(
        response.data?.message ?? "Password changed successfully! Logging out..."
      );

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Log out the user and clear cached client state
      try {
        await logout().unwrap();
      } catch {
        // Continue even if logout endpoint had an issue
      } finally {
        dispatch(apiSlice.util.resetApiState());
        router.push("/login");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-normal/10 text-primary-normal">
          <Icon icon="solar:lock-password-linear" className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          <p className="text-xs text-gray-500">
            Update your password to keep your account secure. You will be logged out after updating.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        {/* Current Password */}
        <div className="space-y-1.5">
          <Label htmlFor="current-password" className="text-xs font-medium text-gray-700">
            Current Password
          </Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={isSubmitting}
              required
              className="h-10 rounded-lg pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Icon
                icon={showCurrent ? "solar:eye-closed-linear" : "solar:eye-linear"}
                className="size-4"
              />
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-xs font-medium text-gray-700">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              disabled={isSubmitting}
              required
              minLength={8}
              className="h-10 rounded-lg pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Icon
                icon={showNew ? "solar:eye-closed-linear" : "solar:eye-linear"}
                className="size-4"
              />
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs font-medium text-gray-700">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              disabled={isSubmitting}
              required
              minLength={8}
              className="h-10 rounded-lg pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Icon
                icon={showConfirm ? "solar:eye-closed-linear" : "solar:eye-linear"}
                className="size-4"
              />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-lg bg-primary-normal px-6 text-xs font-semibold text-black transition-opacity hover:bg-primary-normal/70 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon icon="solar:restart-linear" className="size-4 animate-spin" />
                Updating password...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


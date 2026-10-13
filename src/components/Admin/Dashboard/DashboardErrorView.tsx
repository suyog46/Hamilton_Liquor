"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ParsedDashboardError } from "@/lib/utils/dashboard";

interface DashboardErrorViewProps {
  error: ParsedDashboardError;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function DashboardErrorView({
  error,
  onRetry,
  isRetrying = false,
}: DashboardErrorViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyRequestId = () => {
    if (!error.requestId) return;
    navigator.clipboard.writeText(error.requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 403 FORBIDDEN: signed in, but not an admin. Show access denied and don't retry.
  if (error.isForbidden) {
    return (
      <Card className="border-destructive/30 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center max-w-lg mx-auto">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icon icon="solar:shield-warning-bold" className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Access Denied
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.errorMessage ||
                "You are signed in, but do not have administrative privileges. Only users with the ADMIN role can access this dashboard."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className={buttonVariants({
                size: "sm",
                variant: "default",
                className: "bg-primary-normal hover:bg-primary-hover text-black",
              })}
            >
              Return to Storefront
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 401 UNAUTHORIZED: the session is missing or expired.
  if (error.isUnauthorized) {
    return (
      <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center max-w-lg mx-auto">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Icon icon="solar:user-block-rounded-bold" className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Session Missing or Expired
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.errorMessage ||
                "Your session has expired or is invalid. Please sign in again with your administrator credentials."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className={buttonVariants({
                size: "sm",
                variant: "default",
                className: "bg-primary-normal hover:bg-primary-hover text-black",
              })}
            >
              Sign in to Continue
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 500 SERVER ERROR & other failures: show error with a retry button and include request_id
  return (
    <Card className="border-destructive/20 bg-card shadow-sm">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center max-w-lg mx-auto">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Icon icon="solar:danger-triangle-bold" className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {error.isServerError ? "Server Error (500)" : "Failed to Load Dashboard"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {error.errorMessage ||
              "An unexpected error occurred while communicating with the store API. Please try again."}
          </p>
          {error.errorCode && (
            <p className="text-[11px] font-mono text-muted-foreground">
              Error code: <span className="font-semibold">{error.errorCode}</span>
            </p>
          )}
        </div>

        {error.requestId && (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/40 p-3 text-xs w-full">
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Request ID:
              </span>
              <button
                type="button"
                onClick={handleCopyRequestId}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-active hover:underline"
              >
                <Icon
                  icon={copied ? "solar:check-read-linear" : "solar:copy-linear"}
                  className="size-3.5"
                />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="w-full text-left font-mono text-[11px] text-foreground break-all bg-background px-2 py-1 rounded border">
              {error.requestId}
            </code>
            <p className="text-[10px] text-muted-foreground text-left w-full">
              Please include this Request ID (X-Request-ID) in any bug reports.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-primary-normal hover:bg-primary-hover text-black"
          >
            <Icon
              icon="solar:restart-linear"
              className={`mr-1.5 size-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
          <Link
            href="/admin"
            className={buttonVariants({
              size: "sm",
              variant: "outline",
            })}
          >
            Reload Page
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

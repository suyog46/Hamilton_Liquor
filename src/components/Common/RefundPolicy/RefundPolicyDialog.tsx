"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RefundPolicy from "./RefundPolicy";

interface RefundPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RefundPolicyDialog: React.FC<RefundPolicyDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-3xl overflow-y-auto rounded-2xl p-6 sm:p-8">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="font-title text-xl font-bold text-gray-900">
            Refund &amp; Return Policy
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Hamilton Liquor Store · Maryland Alcohol Sales &amp; Delivery Terms
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <RefundPolicy inDialog />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundPolicyDialog;

"use client";

import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MaintenanceNotice = () => (
  <Dialog open>
    <DialogContent
      showCloseButton={false}
      className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-white/10 bg-black p-7 text-center text-white sm:p-9"
    >
      <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-primary-normal/15 text-primary-normal">
        <Icon icon="solar:settings-minimalistic-linear" className="size-7" />
      </div>
      <DialogHeader className="items-center gap-2 text-center">
        <DialogTitle className="font-title text-2xl font-semibold text-white">
          Site Under Maintenance
        </DialogTitle>
        <DialogDescription className="max-w-sm text-sm leading-6 text-white/65">
          The site is currently under maintenance and will not be functional for the next few hours. Please come back another time.
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

export default MaintenanceNotice;

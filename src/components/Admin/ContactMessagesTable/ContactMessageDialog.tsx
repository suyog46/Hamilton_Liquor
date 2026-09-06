"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  useGetAdminContactMessageQuery,
  useMarkContactMessageReadMutation,
  useMarkContactMessageUnreadMutation,
} from "@/redux/features/contactMessage/contactMessageApiSlice";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

interface ContactMessageDialogProps {
  contactMessageId: string | null;
  onOpenChange: (open: boolean) => void;
}

// Opening the dialog auto-marks an unread message as read (standard inbox
// behavior); the footer button lets the admin flip it back to unread.
export function ContactMessageDialog({
  contactMessageId,
  onOpenChange,
}: ContactMessageDialogProps) {
  const open = Boolean(contactMessageId);
  const { data, isLoading } = useGetAdminContactMessageQuery(
    contactMessageId ?? "",
    { skip: !contactMessageId },
  );
  const [markRead] = useMarkContactMessageReadMutation();
  const [markUnread, { isLoading: isTogglingUnread }] =
    useMarkContactMessageUnreadMutation();

  const message = data?.data;

  useEffect(() => {
    if (message && !message.is_read) {
      markRead(message.id)
        .unwrap()
        .catch((err) => {
          toast.error(getErrorMessage(err, "Failed to mark message as read."));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id, message?.is_read]);

  const handleToggleRead = async () => {
    if (!message) return;
    try {
      if (message.is_read) {
        await markUnread(message.id).unwrap();
        toast.success("Marked as unread.");
      } else {
        await markRead(message.id).unwrap();
        toast.success("Marked as read.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update message."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {isLoading || !message ? (
          <div className="flex flex-col gap-3 py-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {message.subject}
                <Badge variant={message.is_read ? "outline" : "success"}>
                  {message.is_read ? "Read" : "Unread"}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Received {formatDate(message.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                    From
                  </p>
                  <p>{message.full_name}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Phone
                  </p>
                  <p>{message.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-primary-active hover:underline"
                  >
                    {message.email}
                  </a>
                </div>
              </div>

              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
                  Message
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3">
                  {message.message}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isTogglingUnread}
                onClick={handleToggleRead}
                className="gap-1.5"
              >
                <Icon
                  icon={
                    message.is_read
                      ? "solar:letter-unread-linear"
                      : "solar:letter-opened-linear"
                  }
                  className="h-4 w-4"
                />
                {message.is_read ? "Mark as unread" : "Mark as read"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

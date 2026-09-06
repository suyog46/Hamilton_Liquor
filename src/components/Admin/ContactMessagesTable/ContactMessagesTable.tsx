"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAdminContactMessagesQuery,
  type ContactMessage,
  type GetContactMessagesParams,
} from "@/redux/features/contactMessage/contactMessageApiSlice";
import { getContactMessageColumns } from "./columns";
import { ContactMessageDialog } from "./ContactMessageDialog";

const DEFAULT_LIMIT = 10;

type SortBy = NonNullable<GetContactMessagesParams["sort_by"]>;
type SortOrder = NonNullable<GetContactMessagesParams["sort_order"]>;
type ReadFilter = "all" | "unread" | "read";

const SORT_BY_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "created_at", label: "Date received" },
  { value: "updated_at", label: "Last updated" },
  { value: "full_name", label: "Name" },
];

const SORT_ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

const READ_FILTER_OPTIONS: { value: ReadFilter; label: string }[] = [
  { value: "all", label: "All messages" },
  { value: "unread", label: "Unread only" },
  { value: "read", label: "Read only" },
];

interface ContactMessagesTableProps {
  search?: string;
}

export function ContactMessagesTable({ search }: ContactMessagesTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setPage(1);
  }, [search, readFilter]);

  const isRead =
    readFilter === "all" ? undefined : readFilter === "read" ? true : false;

  const { data, isLoading, isFetching, isError } =
    useGetAdminContactMessagesQuery({
      page,
      limit,
      search: search || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      is_read: isRead,
    });

  const messages = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const unreadCount = data?.data.unread_count ?? 0;

  const columns = useMemo(
    () =>
      getContactMessageColumns({
        onView: (message: ContactMessage) => setSelectedMessageId(message.id),
      }),
    [],
  );

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="h-6 w-6 text-destructive"
          />
          <p className="text-xs text-muted-foreground">
            Failed to load messages.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          {pagination
            ? `${pagination.total_items} messages · ${unreadCount} unread`
            : " "}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={READ_FILTER_OPTIONS}
            value={readFilter}
            onValueChange={(value) => value && setReadFilter(value)}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {READ_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={SORT_BY_OPTIONS}
            value={sortBy}
            onValueChange={(value) => value && setSortBy(value)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_BY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={SORT_ORDER_OPTIONS}
            value={sortOrder}
            onValueChange={(value) => value && setSortOrder(value)}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_ORDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isLoading && messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon
              icon="solar:letter-linear"
              className="h-6 w-6 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              {search
                ? "No messages match your search."
                : "No contact messages yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={messages}
          isLoading={isLoading}
          skeletonRows={limit}
        />
      )}

      {pagination && (
        <DataTablePagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          disabled={isFetching}
        />
      )}

      <ContactMessageDialog
        contactMessageId={selectedMessageId}
        onOpenChange={(open) => {
          if (!open) setSelectedMessageId(null);
        }}
      />
    </div>
  );
}

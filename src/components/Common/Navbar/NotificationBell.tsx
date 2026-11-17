"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  fetchEventSource,
  EventStreamContentType,
} from "@microsoft/fetch-event-source";

// -------------------------------------------------------------
// Type Definitions matching backend contracts
// -------------------------------------------------------------
export type NotificationType =
  | "order.confirmed"
  | "admin.order.confirmed"
  | "order.fulfillment_updated"
  | "order.cancelled"
  | "refund.succeeded"
  | (string & {});

export type NotificationResourceType = "order" | null;

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  resource_type: NotificationResourceType;
  resource_id: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ListNotificationsResponse {
  success: boolean;
  data: {
    items: NotificationItem[];
    pagination: NotificationPagination;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  data: NotificationItem;
}

export interface MarkAllReadResponse {
  success: boolean;
  data: {
    updated_count: number;
  };
}

interface NotificationBellProps {
  /**
   * Only connect when user is authenticated.
   * Defaults to true.
   */
  isLoggedIn?: boolean;

  /**
   * Optional filter for notification types.
   * E.g. ['admin.order.confirmed'] for admin side.
   */
  allowedTypes?: NotificationType[];

  /**
   * Base route prefix for order links.
   * Defaults to "/order" (customer). For admin, pass "/admin/orders".
   */
  orderLinkPrefix?: string;
}

const getNotificationTypeConfig = (type: NotificationType) => {
  switch (type) {
    case "order.confirmed":
    case "admin.order.confirmed":
      return {
        icon: "solar:bag-check-outline",
        iconColor: "text-emerald-600",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Confirmed",
      };
    case "order.fulfillment_updated":
      return {
        icon: "solar:delivery-outline",
        iconColor: "text-blue-600",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Status Update",
      };
    case "order.cancelled":
      return {
        icon: "solar:close-circle-linear",
        iconColor: "text-rose-600",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Cancelled",
      };
    case "refund.succeeded":
      return {
        icon: "solar:card-recive-linear",
        iconColor: "text-purple-600",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Refunded",
      };
    default:
      return {
        icon: "solar:bag-4-linear",
        iconColor: "text-primary-normal",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Order",
      };
  }
};

export const NotificationBell = ({
  isLoggedIn = true,
  allowedTypes,
  orderLinkPrefix = "/order",
}: NotificationBellProps) => {
  const router = useRouter();

  // Dropdown open/close & filter state
  const [isOpen, setIsOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pagination, setPagination] = useState<NotificationPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Active stream controller & reconnect tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstConnection = useRef(true);

  // Filter notifications if allowedTypes is specified (e.g. for Admin navbar)
  const displayedNotifications = allowedTypes
    ? notifications.filter((item) => allowedTypes.includes(item.type))
    : notifications;

  const effectiveUnreadCount = allowedTypes
    ? displayedNotifications.filter((n) => !n.read_at).length
    : unreadCount;

  // -------------------------------------------------------------
  // REST Helpers: GET /notifications/unread-count
  // -------------------------------------------------------------
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/notifications/unread-count", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const json: UnreadCountResponse = await res.json();
        setUnreadCount(json.data?.unread_count ?? 0);
      }
    } catch (err) {
      console.error("[Notification] Failed to fetch unread count:", err);
    }
  }, []);

  // -------------------------------------------------------------
  // REST Helpers: GET /notifications?page=1&limit=10&unread_only=false
  // -------------------------------------------------------------
  const fetchNotificationList = useCallback(
    async (options?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 10;
      const isUnreadOnly = options?.unreadOnly ?? unreadOnly;

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        unread_only: String(isUnreadOnly),
      });

      try {
        setIsLoading(true);
        const res = await fetch(`/api/proxy/notifications?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const json: ListNotificationsResponse = await res.json();
          setNotifications(json.data?.items ?? []);
          setPagination(json.data?.pagination ?? null);
        }
      } catch (err) {
        console.error("[Notification] Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [unreadOnly]
  );

  // Full REST refresh (used on ready, resync, and reconnects)
  const refreshNotificationState = useCallback(async () => {
    await Promise.all([fetchUnreadCount(), fetchNotificationList()]);
  }, [fetchUnreadCount, fetchNotificationList]);


  const markAsRead = async (userNotificationId: string) => {
    const now = new Date().toISOString();

    // 1. Optimistic update: mark as read immediately in UI
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === userNotificationId ? { ...n, read_at: n.read_at ?? now } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // 2. Persist to server via PATCH
    try {
      const res = await fetch(`/api/proxy/notifications/${userNotificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        const json: MarkAsReadResponse = await res.json();
        const updatedItem = json.data;

        // Sync with exact server payload
        setNotifications((prev) =>
          prev.map((n) => (n.id === userNotificationId ? updatedItem : n))
        );
      } else {
        // If server failed, revert by refreshing unread count
        fetchUnreadCount();
      }
    } catch (err) {
      console.error(`[Notification] Failed to mark ${userNotificationId} as read:`, err);
      fetchUnreadCount();
    }
  };

  // -------------------------------------------------------------
  // REST Action: POST /notifications/read-all
  // -------------------------------------------------------------
  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const res = await fetch("/api/proxy/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => (n.read_at ? n : { ...n, read_at: now }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("[Notification] Failed to mark all as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // -------------------------------------------------------------
  // Auth Refresh Helper (POST /api/auth/refresh)
  // -------------------------------------------------------------
  const handleAuthRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.error("[Notification] Auth refresh network error:", err);
    }
    // Refresh failed -> Follow app's session-expired logout behavior
    router.push("/login");
    return false;
  }, [router]);

  // -------------------------------------------------------------
  // SSE Connection with @microsoft/fetch-event-source
  // -------------------------------------------------------------
  const connectStream = useCallback(() => {
    if (!isLoggedIn) return;

    // Abort any existing stream before creating a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchEventSource("/api/proxy/notifications/stream", {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
      credentials: "include",
      signal: controller.signal,
      openWhenHidden: true,

      async onopen(response) {
        const contentType = response.headers.get("content-type");

        if (response.ok && contentType?.includes(EventStreamContentType)) {
          // If this is a reconnect (not initial mount), re-read state via REST
          if (!isFirstConnection.current) {
            refreshNotificationState();
          }
          isFirstConnection.current = false;
          return;
        }

        // A reconnect or request with an expired cookie is rejected with 401
        if (response.status === 401) {
          controller.abort();
          const refreshed = await handleAuthRefresh();
          if (refreshed) {
            connectStream();
            refreshNotificationState();
          }
          throw new Error("401 Unauthorized - refreshing session");
        }

        // Fatal client error
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Fatal stream error: ${response.status}`);
        }

        throw new Error(`Unexpected status ${response.status} or Content-Type ${contentType}`);
      },

      onmessage(ev) {
        const eventName = ev.event || "message";

        // 1. On ready: fetch GET /notifications/unread-count and current list (GET /notifications)
        if (eventName === "ready") {
          refreshNotificationState();
          return;
        }

        // 2. On resync: refresh all notification state through REST
        if (eventName === "resync") {
          refreshNotificationState();
          return;
        }

        // 3. On session_expired: Close stream, refresh auth, and reconnect if successful
        if (eventName === "session_expired") {
          controller.abort();
          handleAuthRefresh().then((refreshed) => {
            if (refreshed) {
              connectStream();
              refreshNotificationState();
            }
          });
          return;
        }

        // 4. On notification: complete item payload
        if (eventName === "notification" || eventName === "message") {
          if (!ev.data) return;

          try {
            const payload = JSON.parse(ev.data);

            // Check if inner payload specifies special event
            if (payload.event === "ready" || payload.type === "ready") {
              refreshNotificationState();
              return;
            }
            if (payload.event === "resync" || payload.type === "resync") {
              refreshNotificationState();
              return;
            }
            if (payload.event === "session_expired" || payload.type === "session_expired") {
              controller.abort();
              handleAuthRefresh().then((refreshed) => {
                if (refreshed) {
                  connectStream();
                  refreshNotificationState();
                }
              });
              return;
            }

            const item: NotificationItem = payload.data || payload;
            if (!item?.id) return;

            // Insert by id, replacing any entry already with the same id
            setNotifications((prev) => {
              const index = prev.findIndex((n) => n.id === item.id);
              if (index !== -1) {
                const updated = [...prev];
                updated[index] = item;
                return updated;
              }
              return [item, ...prev];
            });

            // Update unread count (increment locally if unread)
            if (!item.read_at) {
              setUnreadCount((prev) => prev + 1);
            }
          } catch (err) {
            console.error("[Notification] Error parsing notification event:", err);
          }
        }
      },

      onclose() {
        console.log("[Notification] Stream closed by server");
      },

      onerror(err) {
        if (controller.signal.aborted) return;

        // Server suggests 5-second reconnect delay
        return 5000;
      },
    }).catch((err) => {
      if (!controller.signal.aborted) {
        console.error("[Notification] SSE stream error:", err);
      }
    });
  }, [isLoggedIn, refreshNotificationState, handleAuthRefresh]);

  useEffect(() => {
    if (isLoggedIn) {
      connectStream();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isLoggedIn, connectStream]);

  // Re-fetch list when tab filter (all vs unread) changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotificationList({ unreadOnly });
    }
  }, [isLoggedIn, unreadOnly, fetchNotificationList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // 1. Mark as read immediately if not yet read
    if (!item.read_at) {
      markAsRead(item.id);
    }

    // 2. Close dropdown
    setIsOpen(false);

    // 3. Link to order details using orderLinkPrefix
    const orderId =
      item.resource_id ||
      (typeof item.metadata?.order_id === "string" ? item.metadata.order_id : null) ||
      (typeof item.metadata?.id === "string" ? item.metadata.id : null);

    if (orderId) {
      router.push(`${orderLinkPrefix}/${orderId}`);
    } else {
      router.push(orderLinkPrefix);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative inline-flex items-center justify-center p-2 text-primary-normal hover:opacity-80 transition-opacity focus:outline-none"
      >
        <Icon icon="solar:bell-linear" className="w-6 h-6" />

        {/* Unread count badge */}
        {effectiveUnreadCount > 0 && (
          <span className="absolute top-1 right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white leading-none">
            {effectiveUnreadCount > 99 ? "99+" : effectiveUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden text-black animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {effectiveUnreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
                  {effectiveUnreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {effectiveUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={isMarkingAll}
                  className="text-xs font-medium text-primary-normal hover:underline disabled:opacity-50"
                >
                  {isMarkingAll ? "Marking..." : "Mark all as read"}
                </button>
              )}
              <button
                type="button"
                onClick={() => refreshNotificationState()}
                title="Refresh notifications"
                className="p-1 text-gray-500 hover:text-black transition-colors"
              >
                <Icon icon="solar:refresh-linear" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs: All vs Unread */}
          <div className="flex border-b border-gray-100 px-3 py-1.5 gap-2 text-xs bg-white">
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${!unreadOnly
                ? "bg-primary-normal text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setUnreadOnly(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${unreadOnly
                ? "bg-primary-normal text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Unread {effectiveUnreadCount > 0 ? `(${effectiveUnreadCount})` : ""}
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {isLoading && displayedNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <Icon
                  icon="solar:bell-off-linear"
                  className="mx-auto mb-2 h-7 w-7 text-gray-300"
                />
                No notifications found
              </div>
            ) : (
              displayedNotifications.map((item) => {
                const isUnread = !item.read_at;
                const config = getNotificationTypeConfig(item.type);

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 cursor-pointer ${isUnread ? "bg-amber-50/40" : "bg-white"
                      }`}
                  >
                    {/* Status Icon */}
                    <div
                      className={`size-8 shrink-0 rounded-lg flex items-center justify-center bg-gray-100 ${config.iconColor}`}
                    >
                      <Icon icon={config.icon} className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          {isUnread && (
                            <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-semibold truncate ${isUnread ? "text-primary-normal" : "text-gray-900"
                              }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatNotificationTime(item.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">
                        {item.body}
                      </p>

                      <div className="flex items-center gap-2">
                        {/* Event type badge */}
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>

                        {/* Order ID Tag if available */}
                        {item.resource_id && (
                          <span className="text-[10px] font-mono text-gray-500">
                            #{item.resource_id.slice(-8)}
                          </span>
                        )}

                        {isUnread && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.id);
                            }}
                            className="text-[10px] font-medium text-primary-normal hover:underline cursor-pointer"
                          >
                            Mark as read
                          </span>
                        )}

                        <span className="ml-auto text-[10px] font-medium text-primary-normal hover:underline">
                          View Order →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer (Pagination Info if available) */}
          {pagination && pagination.total_items > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50 text-[11px] text-gray-400 text-center">
              Showing {displayedNotifications.length} of {pagination.total_items} notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

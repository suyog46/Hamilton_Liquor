import type { DashboardApiErrorResponse } from "@/redux/features/dashboard/dashboardApiSlice";

/**
 * Store operational timezone.
 * Schedule metrics (today's pickups and deliveries) use this timezone.
 */
export const STORE_TIMEZONE = "America/New_York";

/**
 * Format decimal string amount using Intl.NumberFormat without floating point arithmetic.
 * Never performs floating point calculations on amounts.
 */
export function formatDashboardMoney(
  amount: string | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  const safeAmount = (amount ?? "0.00").trim() || "0.00";

  try {
    // Modern Intl.NumberFormat supports numeric string formatting without float conversion
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount as unknown as number);
  } catch {
    // Robust manual fallback preserving exact decimal string without floating point arithmetic
    const isNegative = safeAmount.startsWith("-");
    const cleanAmount = isNegative ? safeAmount.slice(1) : safeAmount;
    const [rawInt = "0", rawDec = "00"] = cleanAmount.split(".");
    const formattedInt = rawInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const paddedDec = (rawDec + "00").slice(0, 2);
    const prefix = currency === "USD" ? "$" : `${currency} `;
    return `${isNegative ? "-" : ""}${prefix}${formattedInt}.${paddedDec}`;
  }
}

/**
 * Format a date in the store's America/New_York timezone.
 */
export function formatStoreDate(
  dateInput: Date | string = new Date(),
  locale = "en-US"
): string {
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat(locale, {
      timeZone: STORE_TIMEZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

/**
 * Format the generated_at UTC ISO timestamp for display as "last updated".
 * Supports UTC ISO 8601 with Z (and non-zero fractional seconds).
 */
export function formatGeneratedAt(
  isoString?: string | null,
  locale = "en-US"
): { formattedLocal: string; formattedStore: string; rawUtc: string } {
  if (!isoString) {
    return {
      formattedLocal: "Just now",
      formattedStore: "Just now",
      rawUtc: "",
    };
  }

  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return {
        formattedLocal: isoString,
        formattedStore: isoString,
        rawUtc: isoString,
      };
    }

    const formattedLocal = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);

    const formattedStore = new Intl.DateTimeFormat(locale, {
      timeZone: STORE_TIMEZONE,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);

    return {
      formattedLocal,
      formattedStore,
      rawUtc: isoString,
    };
  } catch {
    return {
      formattedLocal: isoString,
      formattedStore: isoString,
      rawUtc: isoString,
    };
  }
}

export interface ParsedDashboardError {
  status?: number | string;
  isUnauthorized: boolean;
  isForbidden: boolean;
  isServerError: boolean;
  requestId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Parse an RTK Query error returned from the dashboard endpoint.
 */
export function parseDashboardError(error: unknown): ParsedDashboardError {
  if (!error || typeof error !== "object") {
    return {
      isUnauthorized: false,
      isForbidden: false,
      isServerError: false,
      errorMessage: "An unexpected error occurred.",
    };
  }

  const errObj = error as Record<string, unknown>;
  const status = typeof errObj.status === "number" ? errObj.status : undefined;
  const errorData = (errObj.data as DashboardApiErrorResponse | undefined) || undefined;

  const requestId =
    errorData?.request_id ||
    (typeof errObj.xRequestId === "string" ? errObj.xRequestId : undefined) ||
    (typeof errObj.requestId === "string" ? errObj.requestId : undefined);

  const errorCode = errorData?.error?.code;
  const errorMessage =
    errorData?.error?.message ||
    (typeof errObj.error === "string" ? errObj.error : undefined) ||
    "An error occurred while loading dashboard metrics.";

  const isUnauthorized = status === 401;
  const isForbidden = status === 403;
  const isServerError = typeof status === "number" ? status >= 500 : false;

  return {
    status,
    isUnauthorized,
    isForbidden,
    isServerError,
    requestId,
    errorCode,
    errorMessage,
  };
}

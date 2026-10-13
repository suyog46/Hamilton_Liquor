/**
 * Cleanly format an arbitrary decimal money amount without precision loss or floating-point bugs.
 * Handles strings with leading +, leading zeros, or high-precision decimal parts.
 */
export function formatCustomerMoney(
  rawAmount: string | number | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (rawAmount === null || rawAmount === undefined || rawAmount === "") {
    return currency === "USD" ? "$0.00" : `${currency} 0.00`;
  }

  let str = String(rawAmount).trim();
  const isNegative = str.startsWith("-");
  // Remove leading sign (+ or -)
  str = str.replace(/^[+-]/, "");

  let [intPart = "0", decPart = ""] = str.split(".");

  // Strip leading zeros from the integer portion, preserving at least one 0
  intPart = intPart.replace(/^0+(?=\d)/, "");
  if (!intPart) intPart = "0";

  // Format integer portion with thousands separators
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Format decimal portion to 2 places
  const formattedDec = (decPart + "00").slice(0, 2);

  const prefix = isNegative ? "-" : "";
  const currencySymbol = currency === "USD" ? "$" : `${currency} `;

  return `${prefix}${currencySymbol}${formattedInt}.${formattedDec}`;
}

/**
 * Format date for customer timeline or activity.
 */
export function formatCustomerDate(
  dateStr?: string | null,
  includeTime = false,
  locale = "en-US"
): string {
  if (!dateStr) return "Never";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;

    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(includeTime && {
        hour: "numeric",
        minute: "2-digit",
      }),
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Extract 1-2 initials from a customer's name.
 */
export function getCustomerInitials(name?: string | null): string {
  if (!name || !name.trim()) return "CU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

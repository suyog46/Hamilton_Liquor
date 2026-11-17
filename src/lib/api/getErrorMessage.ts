import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

export interface ApiErrorPayload {
  success?: boolean;
  request_id?: string;
  timestamp?: string;
  message?: string;
  detail?: string | Array<{ msg?: string; message?: string }>;
  error?:
    | {
        code?: string;
        message?: string;
        details?: unknown;
      }
    | string;
}

/**
 * Extracts human-readable error messages from API responses.
 * Specifically handles the standard backend error structure:
 * {
 *   success: false,
 *   request_id: "...",
 *   error: {
 *     code: "BRAND_HAS_PRODUCTS",
 *     message: "This brand cannot be deleted because it has products. Deactivate it instead."
 *   }
 * }
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "An unexpected error occurred."
): string {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as ApiErrorPayload | undefined;
    if (!data) return fallback;

    // 1. Check nested error object: data.error.message
    if (typeof data.error === "object" && data.error !== null) {
      if (typeof data.error.message === "string" && data.error.message.trim()) {
        return data.error.message;
      }
    }

    // 2. Check if data.error is a direct string
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    // 3. Check data.message
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    // 4. Check data.detail (FastAPI / Pydantic validation errors)
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        if (typeof first.msg === "string") return first.msg;
        if (typeof first.message === "string") return first.message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}


import { create } from "zustand";
import type {
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  CheckoutRequest,
} from "@/redux/features/order/orderApiSlice";

interface CheckoutPreviewPayload {
  previewResponse: CheckoutPreviewResponse;
  previewRequest: CheckoutPreviewRequest;
  paymentRequest: CheckoutRequest;
  idempotencyKey: string;
}

interface CheckoutStore {
  previewResponse: CheckoutPreviewResponse | null;
  previewRequest: CheckoutPreviewRequest | null;
  paymentRequest: CheckoutRequest | null;
  idempotencyKey: string | null;
  setPreview: (payload: CheckoutPreviewPayload) => void;
  clearPreview: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  previewResponse: null,
  previewRequest: null,
  paymentRequest: null,
  idempotencyKey: null,
  setPreview: ({ previewResponse, previewRequest, paymentRequest, idempotencyKey }) =>
    set({ previewResponse, previewRequest, paymentRequest, idempotencyKey }),
  clearPreview: () =>
    set({
      previewResponse: null,
      previewRequest: null,
      paymentRequest: null,
      idempotencyKey: null,
    }),
}));

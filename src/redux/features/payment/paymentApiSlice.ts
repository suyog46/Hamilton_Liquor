import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";

export interface CheckoutStatusData {
  can_resume_payment: boolean;
}

export interface ResumePaymentData {
  checkout_url: string;
}

export interface RetryPaymentData {
  payment_attempt_id: string;
  checkout_url: string;
}

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentCheckoutStatus: builder.query<ApiResponse<CheckoutStatusData>, string>({
      query: (paymentId) => `payments/${paymentId}/checkout-status`,
      providesTags: (_result, _error, paymentId) => [{ type: "Payment", id: paymentId }],
    }),

    resumePayment: builder.mutation<ApiResponse<ResumePaymentData>, string>({
      query: (paymentId) => ({
        url: `payments/${paymentId}/resume`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, paymentId) => [
        { type: "Payment", id: paymentId },
        { type: "Order", id: "LIST" },
      ],
    }),

    retryPayment: builder.mutation<ApiResponse<RetryPaymentData>, string>({
      query: (paymentId) => ({
        url: `payments/${paymentId}/retry`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, paymentId) => [
        { type: "Payment", id: paymentId },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPaymentCheckoutStatusQuery,
  useLazyGetPaymentCheckoutStatusQuery,
  useResumePaymentMutation,
  useRetryPaymentMutation,
} = paymentApiSlice;

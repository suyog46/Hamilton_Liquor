import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";

export interface DashboardOrdersByStatus {
  PENDING: number;
  CONFIRMED: number;
  FULFILLED: number;
  CANCELLED: number;
  REFUSED: number;
}

export interface DashboardFulfillmentBacklog {
  PENDING: number;
  PREPARING: number;
  READY_FOR_PICKUP: number;
  READY_FOR_DELIVERY: number;
  OUT_FOR_DELIVERY: number;
}

export interface DashboardOrders {
  total: number;
  by_status: DashboardOrdersByStatus;
  fulfillment_backlog: DashboardFulfillmentBacklog;
}

export interface DashboardProducts {
  total: number;
  active: number;
  inactive: number;
  out_of_stock_variants: number;
}

export interface DashboardCustomers {
  total: number;
}

export interface DashboardMoneyAmount {
  amount: string;
  currency: string;
  calculation_label?: string;
}

export interface DashboardRevenue {
  net_revenue: DashboardMoneyAmount;
  gross_captured_amount: DashboardMoneyAmount;
  refunded_amount: DashboardMoneyAmount;
}

export interface DashboardSchedule {
  todays_pickups: number;
  todays_deliveries: number;
}

export interface AdminDashboardData {
  orders: DashboardOrders;
  products: DashboardProducts;
  customers: DashboardCustomers;
  revenue: DashboardRevenue;
  schedule: DashboardSchedule;
  generated_at: string;
}

export type AdminDashboardResponse = ApiResponse<AdminDashboardData>;

export interface DashboardApiErrorDetails {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface DashboardApiErrorResponse {
  success: false;
  request_id?: string;
  timestamp?: string;
  error?: DashboardApiErrorDetails;
}

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => "admin/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetAdminDashboardQuery } = dashboardApiSlice;

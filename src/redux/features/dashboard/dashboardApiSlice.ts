import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";

export interface AdminDashboardStats {
  total_orders: number;
  total_products: number;
  total_customers: number;
  total_revenue: string;
}

export type AdminDashboardResponse = ApiResponse<AdminDashboardStats>;

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => "admin/dashboard",
    }),
  }),
});

export const { useGetAdminDashboardQuery } = dashboardApiSlice;

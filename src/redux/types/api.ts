export interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ListData<T> {
  items: T[];
  pagination: Pagination;
}

export type ApiListResponse<T> = ApiResponse<ListData<T>>;

// Base query params shared by every "list" (GET) endpoint. Each slice
// narrows `sort_by` to whatever fields that resource actually supports.
export interface BaseGetListParams<SortBy extends string = string> {
  page?: number;
  limit?: number;
  search?: string | null;
  sort_by?: SortBy;
  sort_order?: "asc" | "desc";
}

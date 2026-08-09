import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, BaseGetListParams } from "@/redux/types/api";

export interface Country {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  flag: {
    id: string;
    url: string;
  };
}

export type CountryListResponse = ApiListResponse<Country>;

export type GetCountriesParams = BaseGetListParams<"name" | "created_at" | "updated_at">;

export const countryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<CountryListResponse, GetCountriesParams | void>({
      query: (params) => ({
        url: "admin/countries",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Country" as const, id })),
              { type: "Country" as const, id: "LIST" },
            ]
          : [{ type: "Country" as const, id: "LIST" }],
    }),

    // Public storefront listing — no admin/ prefix, no auth required.
    getPublicCountries: builder.query<CountryListResponse, GetCountriesParams | void>({
      query: (params) => ({
        url: "countries",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Country" as const, id })),
              { type: "Country" as const, id: "PUBLIC_LIST" },
            ]
          : [{ type: "Country" as const, id: "PUBLIC_LIST" }],
    }),
  }),
});

export const { useGetCountriesQuery, useGetPublicCountriesQuery } = countryApiSlice;

import { apiSlice } from "@/redux/apiSlice";
import type {
  ApiListResponse,
  ApiResponse,
  BaseGetListParams,
} from "@/redux/types/api";

export interface Address {
  id: string;
  recipient_first_name: string;
  recipient_last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  label: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressInput {
  recipient_first_name: string;
  recipient_last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  label: string;
  is_default: boolean;
}

export type AddressListResponse = ApiListResponse<Address>;
export type AddressResponse = ApiResponse<Address>;
export type GetAddressesParams = Pick<BaseGetListParams, "page" | "limit">;

export const addressApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<AddressListResponse, GetAddressesParams | void>({
      query: (params) => ({ url: "addresses", params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Address" as const, id })),
              { type: "Address" as const, id: "LIST" },
            ]
          : [{ type: "Address" as const, id: "LIST" }],
    }),
    getAddressDetail: builder.query<AddressResponse, string>({
      query: (addressId) => `addresses/${addressId}`,
      providesTags: (_result, _error, addressId) => [{ type: "Address", id: addressId }],
    }),
    createAddress: builder.mutation<AddressResponse, AddressInput>({
      query: (body) => ({ url: "addresses", method: "POST", body }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
    updateAddress: builder.mutation<AddressResponse, AddressInput & { address_id: string }>({
      query: ({ address_id, ...body }) => ({
        url: `addresses/${address_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { address_id }) => [
        { type: "Address", id: address_id },
        { type: "Address", id: "LIST" },
      ],
    }),
    deleteAddress: builder.mutation<void, string>({
      query: (addressId) => ({ url: `addresses/${addressId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, addressId) => [
        { type: "Address", id: addressId },
        { type: "Address", id: "LIST" },
      ],
    }),
    setDefaultAddress: builder.mutation<AddressResponse, string>({
      query: (addressId) => ({
        url: `addresses/${addressId}`,
        method: "PATCH",
        body: { is_default: true },
      }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useLazyGetAddressDetailQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApiSlice;

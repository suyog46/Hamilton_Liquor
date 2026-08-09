import { apiSlice } from "@/redux/apiSlice";

export interface UploadMediaResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
  };
}

export const mediaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<UploadMediaResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "admin/media",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useUploadMediaMutation } = mediaApiSlice;

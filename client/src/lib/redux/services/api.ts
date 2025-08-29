import { type ChangeToneRequest, type ChangeToneResponse } from "@/lib/types";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  }),
  endpoints: (builder) => ({
    changeTone: builder.mutation<ChangeToneResponse, ChangeToneRequest>({
      query: (body) => ({
        url: "/tone",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useChangeToneMutation } = api;

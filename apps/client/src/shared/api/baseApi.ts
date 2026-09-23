import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL, // адрес api-gateway
    credentials: "include", // включаем отправку куки
  }),
  tagTypes: ["Auth", "Car", "Booking"],
  endpoints: () => ({}),
});

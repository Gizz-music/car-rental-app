import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/",
    credentials: "include", // включаем отправку куки
  }),
  tagTypes: ["Auth"],
  endpoints: () => ({}),
});

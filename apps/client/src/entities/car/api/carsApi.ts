import { baseApi } from "@/shared/api/baseApi";

import type { CarsPage, CarsQueryParams } from "../model/types";

export const carsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    cars: build.query<CarsPage, CarsQueryParams>({
      query: (params) => ({
        url: "cars",
        params,
      }),
      providesTags: ["Car"],
    }),
  }),
});

export const { useCarsQuery } = carsApi;

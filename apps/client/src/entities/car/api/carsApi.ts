import { baseApi } from "@/shared/api/baseApi";

import type { CarsQueryParams, CarWithAvailability } from "../model/types";

export const carsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    cars: build.query<CarWithAvailability[], CarsQueryParams | void>({
      query: (params) => ({
        url: "cars",
        params: params ?? undefined,
      }),
      providesTags: ["Car"],
    }),
  }),
});

export const { useCarsQuery } = carsApi;

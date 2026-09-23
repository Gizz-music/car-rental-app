import { baseApi } from "@/shared/api/baseApi";

import type { Booking, CreateBookingRequest } from "../model/types";

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    myBookings: build.query<Booking[], void>({
      query: () => "bookings",
      providesTags: ["Booking"],
    }),

    // Бронь и отмена меняют доступность авто, поэтому обновляем и каталог
    createBooking: build.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: "bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking", "Car"],
    }),

    cancelBooking: build.mutation<Booking, number>({
      query: (bookingId) => ({
        url: `bookings/${bookingId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Booking", "Car"],
    }),
  }),
});

export const {
  useMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;

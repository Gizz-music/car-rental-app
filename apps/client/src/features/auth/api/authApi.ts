import { baseApi } from "@/shared/api/baseApi";

import type {
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
  User,
} from "../model/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<User, RegisterRequest>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Booking"],
    }),

    login: build.mutation<User, LoginRequest>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Booking"],
    }),

    logout: build.mutation<LogoutResponse, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Booking"],
    }),

    currentUser: build.query<User, void>({
      query: () => ({
        url: "auth/current-user",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useCurrentUserQuery,
} = authApi;

import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { authApi } from "../api/authApi";
import type { AuthState } from "./types";

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Регистрация, вход и восстановление сессии (F5) возвращают текущего пользователя
    builder.addMatcher(
      isAnyOf(
        authApi.endpoints.register.matchFulfilled,
        authApi.endpoints.login.matchFulfilled,
        authApi.endpoints.currentUser.matchFulfilled,
      ),
      (state, action) => {
        state.user = action.payload;
      },
    );

    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
    });
  },
  selectors: {
    selectCurrentUser: (state) => state.user,
  },
});

export const { selectCurrentUser } = authSlice.selectors;
export const authReducer = authSlice.reducer;

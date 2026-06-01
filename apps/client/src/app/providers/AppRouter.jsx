import React from "react";
import { Route, Routes } from "react-router-dom";

import { BaseLayout } from "@/app/layouts/BaseLayout/index.js";
import { HomePage } from "@/pages/HomePage/index.js";
import { LoginPage } from "@/pages/LoginPage/index.js";
import { RegistrationPage } from "@/pages/RegistrationPage/index.js";

export const AppRouter = () => {
  return (
    <BaseLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Routes>
    </BaseLayout>
  );
};

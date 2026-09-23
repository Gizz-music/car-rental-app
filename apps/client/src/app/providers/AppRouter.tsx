import { Route, Routes } from "react-router-dom";

import { BaseLayout } from "@/app/layouts/BaseLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegistrationPage } from "@/pages/RegistrationPage";

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

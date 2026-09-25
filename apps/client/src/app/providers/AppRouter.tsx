import { Route, Routes } from "react-router-dom";

import { BaseLayout } from "@/app/layouts/BaseLayout";
import { RequireAuth } from "@/features/auth/providers/RequireAuth";
import { CarsPage } from "@/pages/CarsPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegistrationPage } from "@/pages/RegistrationPage";

export const AppRouter = () => {
  return (
    <BaseLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
      </Routes>
    </BaseLayout>
  );
};

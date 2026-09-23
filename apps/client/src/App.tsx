import { Theme, presetGpnDefault } from "@consta/uikit/Theme";

import { useCurrentUserQuery } from "@/features/auth/api/authApi";

import { AppRouter } from "@/app/providers";
import { Header } from "@/widgets/header";

import "./App.css";

export const App = () => {
  const { isLoading } = useCurrentUserQuery();

  if (isLoading) {
    return <div>Инициализация приложения...</div>;
  }

  return (
    <Theme preset={presetGpnDefault}>
      <Header />
      <AppRouter />
    </Theme>
  );
};

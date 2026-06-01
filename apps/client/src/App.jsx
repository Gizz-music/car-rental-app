import React from "react";
import { Theme, presetGpnDefault } from "@consta/uikit/Theme";

import { AppRouter } from "@/app/providers/index.js";
import { Navbar } from "@/widgets/navbar/index.js";

import "./App.css";

export const App = () => {
  return (
    <Theme preset={presetGpnDefault}>
      <Navbar />
      <AppRouter />
    </Theme>
  );
};

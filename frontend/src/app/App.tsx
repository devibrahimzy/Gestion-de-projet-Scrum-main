import React, { useEffect } from "react";
import AppRouter from "./router";
import Providers from "./providers";
import { Toaster } from "@/shared/components/ui/toaster";
import { useAuthStore } from "@/features/auth/auth.store";
import "../index.css";

export const App: React.FC = () => {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <Providers>
      <AppRouter />
      <Toaster />
    </Providers>
  );
};

export default App;

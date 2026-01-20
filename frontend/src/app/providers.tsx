import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../features/auth/auth.store";

// You can add more providers here (ThemeProvider, ToastProvider, etc.)

interface ProvidersProps {
  children: ReactNode;
}

// Initialize React Query client
const queryClient = new QueryClient();

const Providers: React.FC<ProvidersProps> = ({ children }) => {

  return (
    <QueryClientProvider client={queryClient}>
      {/* Add more providers here if needed */}
      {children}
    </QueryClientProvider>
  );
};

export default Providers;

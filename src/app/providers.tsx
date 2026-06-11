"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useSelector } from "react-redux";
import { ReactNode, useMemo } from "react";
import { store, RootState } from "@/store/store";

function ThemeBoundary({ children }: { children: ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.commerce.darkMode);
  return <div className={darkMode ? "dark min-h-screen bg-background text-foreground" : "min-h-screen bg-background text-foreground"}>{children}</div>;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeBoundary>{children}</ThemeBoundary>
      </QueryClientProvider>
    </Provider>
  );
}

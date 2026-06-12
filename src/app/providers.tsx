"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ReactNode, useMemo, useEffect } from "react";
import { store, RootState, setProducts, setOrders, loginUser, setPriceTier } from "@/store/store";

function StateHydrator({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.commerce);

  useEffect(() => {
    // 1. Products
    const storedProducts = localStorage.getItem("jahanara_products");
    if (storedProducts) {
      try {
        dispatch(setProducts(JSON.parse(storedProducts)));
      } catch (e) {
        console.error("Failed to parse stored products:", e);
      }
    } else {
      localStorage.setItem("jahanara_products", JSON.stringify(state.products));
    }

    // 2. User
    const storedUser = localStorage.getItem("jahanara_user");
    if (storedUser) {
      try {
        dispatch(loginUser(JSON.parse(storedUser)));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    // 3. Price Tier
    const storedPriceTier = localStorage.getItem("jahanara_price_tier");
    if (storedPriceTier) {
      try {
        dispatch(setPriceTier(JSON.parse(storedPriceTier)));
      } catch (e) {
        console.error("Failed to parse stored price tier:", e);
      }
    }

    // 4. Orders
    const storedOrders = localStorage.getItem("jahanara_orders");
    if (storedOrders) {
      try {
        dispatch(setOrders(JSON.parse(storedOrders)));
      } catch (e) {
        console.error("Failed to parse stored orders:", e);
      }
    }
  }, [dispatch]);

  // Sync state back to localStorage on change
  useEffect(() => {
    if (state.products && state.products.length > 0) {
      localStorage.setItem("jahanara_products", JSON.stringify(state.products));
    }
  }, [state.products]);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem("jahanara_user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("jahanara_user");
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem("jahanara_price_tier", JSON.stringify(state.priceTier));
  }, [state.priceTier]);

  useEffect(() => {
    localStorage.setItem("jahanara_orders", JSON.stringify(state.orders));
  }, [state.orders]);

  return <>{children}</>;
}

function ThemeBoundary({ children }: { children: ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.commerce.darkMode);
  return <div className={darkMode ? "dark min-h-screen bg-background text-foreground" : "min-h-screen bg-background text-foreground"}>{children}</div>;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StateHydrator>
          <ThemeBoundary>{children}</ThemeBoundary>
        </StateHydrator>
      </QueryClientProvider>
    </Provider>
  );
}

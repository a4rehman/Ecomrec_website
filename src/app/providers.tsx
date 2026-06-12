"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ReactNode, useMemo, useEffect } from "react";
import { store, RootState, setProducts, setOrders, loginUser, setPriceTier } from "@/store/store";

function StateHydrator({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.commerce);

  useEffect(() => {
    // 1. Products (Fetch dynamically from SQLite Database)
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((p: any) => ({
            ...p,
            slug: p.id,
            name: p.title,
            images: [p.imagePath],
            sizes: p.sizes ? p.sizes.split(", ") : ["S", "M", "L"],
            colors: p.colors ? p.colors.split(", ") : ["Default"],
            fabric: "Premium",
            stock: p.inStock ? 10 : 0,
            rating: p.rating || 5,
            reviews: p.reviews || 1,
            brand: p.brand || "Sawera"
          }));
          dispatch(setProducts(mapped));
        }
      })
      .catch((e) => console.error("Failed to fetch database products in provider:", e));

    // 2. User
    const storedUser = localStorage.getItem("sawera_user");
    if (storedUser) {
      try {
        dispatch(loginUser(JSON.parse(storedUser)));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    // 3. Price Tier
    const storedPriceTier = localStorage.getItem("SAWERA_price_tier");
    if (storedPriceTier) {
      try {
        dispatch(setPriceTier(JSON.parse(storedPriceTier)));
      } catch (e) {
        console.error("Failed to parse stored price tier:", e);
      }
    }

    // 4. Orders
    const storedOrders = localStorage.getItem("SAWERA_orders");
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
      localStorage.setItem("SAWERA_products", JSON.stringify(state.products));
    }
  }, [state.products]);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem("sawera_user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("sawera_user");
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem("SAWERA_price_tier", JSON.stringify(state.priceTier));
  }, [state.priceTier]);

  useEffect(() => {
    localStorage.setItem("SAWERA_orders", JSON.stringify(state.orders));
  }, [state.orders]);

  return <>{children}</>;
}

function ThemeBoundary({ children }: { children: ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.commerce.darkMode);
  return <div className={darkMode ? "dark min-h-screen bg-background text-foreground" : "min-h-screen bg-background text-foreground"}>{children}</div>;
}

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <SessionProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <StateHydrator>
            <ThemeBoundary>{children}</ThemeBoundary>
          </StateHydrator>
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
}

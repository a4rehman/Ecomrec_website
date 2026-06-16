"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ReactNode, useMemo, useEffect } from "react";
import { store, RootState, setProducts, setOrders, loginUser, setPriceTier } from "@/store/store";
import { products as catalogProducts } from "@/data/products";

const PRODUCTS_STORAGE_KEY = "jahanara_products";
const PRODUCTS_STORAGE_VERSION_KEY = "jahanara_products_version";
const PRODUCTS_STORAGE_VERSION = "2026-06-16-sharp-products-update";

function StateHydrator({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.commerce);

  useEffect(() => {
    // 1. Products
    const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const storedProductsVersion = localStorage.getItem(PRODUCTS_STORAGE_VERSION_KEY);
    if (storedProducts && storedProductsVersion === PRODUCTS_STORAGE_VERSION) {
      try {
        dispatch(setProducts(JSON.parse(storedProducts)));
      } catch (e) {
        console.error("Failed to parse stored products:", e);
        dispatch(setProducts(catalogProducts));
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(catalogProducts));
        localStorage.setItem(PRODUCTS_STORAGE_VERSION_KEY, PRODUCTS_STORAGE_VERSION);
      }
    } else {
      dispatch(setProducts(catalogProducts));
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(catalogProducts));
      localStorage.setItem(PRODUCTS_STORAGE_VERSION_KEY, PRODUCTS_STORAGE_VERSION);
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
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(state.products));
      localStorage.setItem(PRODUCTS_STORAGE_VERSION_KEY, PRODUCTS_STORAGE_VERSION);
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

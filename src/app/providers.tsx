"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { ReactNode, useEffect, useRef } from "react";
import { store, RootState, setProducts, setOrders, loginUser, setPriceTier } from "@/store/store";
import { products as catalogProducts } from "@/data/products";

const PRODUCTS_STORAGE_KEY = "jahanara_products";
const PRODUCTS_STORAGE_VERSION_KEY = "jahanara_products_version";
const PRODUCTS_STORAGE_VERSION = "2026-06-17-screenshot-products";

function StateHydrator({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.commerce);
  const productsAlreadyStored = useRef(false);

  useEffect(() => {
    // 1. Products
    let storedProductsVersion = null;
    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      storedProductsVersion = localStorage.getItem(PRODUCTS_STORAGE_VERSION_KEY);
      if (raw && storedProductsVersion === PRODUCTS_STORAGE_VERSION) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          productsAlreadyStored.current = true;
          dispatch(setProducts(parsed));
          // Stored catalog is current — skip writing it back on mount.
        } else {
          productsAlreadyStored.current = false;
          dispatch(setProducts(catalogProducts));
        }
      } else {
        productsAlreadyStored.current = false;
        dispatch(setProducts(catalogProducts));
      }
    } catch (e) {
      console.error("Failed to parse stored products:", e);
      productsAlreadyStored.current = false;
      dispatch(setProducts(catalogProducts));
    }

    // 2. User
    try {
      const storedUser = localStorage.getItem("jahanara_user");
      if (storedUser) dispatch(loginUser(JSON.parse(storedUser)));
    } catch (e) {
      console.error("Failed to parse stored user:", e);
    }

    // 3. Price Tier
    try {
      const storedPriceTier = localStorage.getItem("jahanara_price_tier");
      if (storedPriceTier) dispatch(setPriceTier(JSON.parse(storedPriceTier)));
    } catch (e) {
      console.error("Failed to parse stored price tier:", e);
    }

    // 4. Orders
    try {
      const storedOrders = localStorage.getItem("jahanara_orders");
      if (storedOrders) dispatch(setOrders(JSON.parse(storedOrders)));
    } catch (e) {
      console.error("Failed to parse stored orders:", e);
    }
  }, [dispatch]);

  // Persist catalog only when it changed vs. what's already stored.
  // Deferred off the critical path so large serialization never blocks hydration.
  useEffect(() => {
    if (productsAlreadyStored.current || !state.products || state.products.length === 0) return;
    productsAlreadyStored.current = true;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(state.products));
        localStorage.setItem(PRODUCTS_STORAGE_VERSION_KEY, PRODUCTS_STORAGE_VERSION);
      } catch (e) {
        console.error("Failed to persist products:", e);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [state.products]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (state.user) localStorage.setItem("jahanara_user", JSON.stringify(state.user));
        else localStorage.removeItem("jahanara_user");
      } catch (e) {
        console.error("Failed to persist user:", e);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem("jahanara_price_tier", JSON.stringify(state.priceTier));
      } catch (e) {
        console.error("Failed to persist price tier:", e);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.priceTier]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem("jahanara_orders", JSON.stringify(state.orders));
      } catch (e) {
        console.error("Failed to persist orders:", e);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.orders]);

  return <>{children}</>;
}

function ThemeBoundary({ children }: { children: ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.commerce.darkMode);
  return <div className={darkMode ? "dark min-h-screen bg-background text-foreground" : "min-h-screen bg-background text-foreground"}>{children}</div>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <StateHydrator>
        <ThemeBoundary>{children}</ThemeBoundary>
      </StateHydrator>
    </Provider>
  );
}

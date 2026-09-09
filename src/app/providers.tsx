"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { ReactNode, useEffect } from "react";
import { store, RootState, setProducts, setOrders, loginUser, setPriceTier, setDarkMode } from "@/store/store";

function StateHydrator({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.commerce);

  useEffect(() => {
    // The database API, not browser storage, is the only catalog source of truth.
    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok || !Array.isArray(data.products)) throw new Error(data.message || "Unable to load products");
        dispatch(setProducts(data.products));
      })
      .catch((error) => console.error("Unable to load product catalog:", error));

    try {
      const storedDarkMode = localStorage.getItem("jahanara_dark_mode");
      if (storedDarkMode !== null) dispatch(setDarkMode(JSON.parse(storedDarkMode)));
    } catch (error) {
      console.error("Failed to parse stored dark mode:", error);
    }
    try {
      const storedUser = localStorage.getItem("jahanara_user");
      if (storedUser) dispatch(loginUser(JSON.parse(storedUser)));
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
    try {
      const storedPriceTier = localStorage.getItem("jahanara_price_tier");
      if (storedPriceTier) dispatch(setPriceTier(JSON.parse(storedPriceTier)));
    } catch (error) {
      console.error("Failed to parse stored price tier:", error);
    }
    try {
      const storedOrders = localStorage.getItem("jahanara_orders");
      if (storedOrders) dispatch(setOrders(JSON.parse(storedOrders)));
    } catch (error) {
      console.error("Failed to parse stored orders:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try { localStorage.setItem("jahanara_dark_mode", JSON.stringify(state.darkMode)); }
      catch (error) { console.error("Failed to persist dark mode:", error); }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.darkMode]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (state.user) localStorage.setItem("jahanara_user", JSON.stringify(state.user));
        else localStorage.removeItem("jahanara_user");
      } catch (error) {
        console.error("Failed to persist user:", error);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try { localStorage.setItem("jahanara_price_tier", JSON.stringify(state.priceTier)); }
      catch (error) { console.error("Failed to persist price tier:", error); }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.priceTier]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try { localStorage.setItem("jahanara_orders", JSON.stringify(state.orders)); }
      catch (error) { console.error("Failed to persist orders:", error); }
    }, 0);
    return () => clearTimeout(timeout);
  }, [state.orders]);

  return <>{children}</>;
}

function ThemeBoundary({ children }: { children: ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.commerce.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return <div className={darkMode ? "dark min-h-screen bg-background text-foreground" : "min-h-screen bg-background text-foreground"}>{children}</div>;
}

export function Providers({ children }: { children: ReactNode }) {
  return <Provider store={store}><StateHydrator><ThemeBoundary>{children}</ThemeBoundary></StateHydrator></Provider>;
}

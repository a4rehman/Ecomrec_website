import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

type Line = { id: string; qty: number; size?: string; color?: string };
type CommerceState = { cart: Line[]; wishlist: string[]; recentlyViewed: string[]; darkMode: boolean };

const initialState: CommerceState = { cart: [], wishlist: [], recentlyViewed: [], darkMode: false };

const commerceSlice = createSlice({
  name: "commerce",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Line>) => {
      const found = state.cart.find((i) => i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color);
      if (found) found.qty += action.payload.qty;
      else state.cart.push(action.payload);
    },
    updateQty: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      state.cart = state.cart.map((i) => (i.id === action.payload.id ? { ...i, qty: Math.max(1, action.payload.qty) } : i));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((i) => i.id !== action.payload);
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.includes(action.payload)
        ? state.wishlist.filter((id) => id !== action.payload)
        : [...state.wishlist, action.payload];
    },
    viewProduct: (state, action: PayloadAction<string>) => {
      state.recentlyViewed = [action.payload, ...state.recentlyViewed.filter((id) => id !== action.payload)].slice(0, 6);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    clearCart: (state) => {
      state.cart = [];
    }
  }
});

export const { addToCart, updateQty, removeFromCart, toggleWishlist, viewProduct, toggleDarkMode, clearCart } = commerceSlice.actions;

export const store = configureStore({ reducer: { commerce: commerceSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, products as initialProducts } from "@/data/products";

type Line = { id: string; qty: number; size?: string; color?: string };
export type User = { id?: string; email: string; name: string; role: "admin" | "user" };
export type Order = { id: string; items: Line[]; total: number; name: string; email: string; address: string; city: string; zip: string; phone: string; date: string; status: string };

type CommerceState = {
  cart: Line[];
  wishlist: string[];
  recentlyViewed: string[];
  darkMode: boolean;
  products: Product[];
  user: User | null;
  priceTier: "all" | "premium" | "simple";
  orders: Order[];
};

const initialState: CommerceState = {
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  darkMode: false,
  products: initialProducts,
  user: null,
  priceTier: "all",
  orders: []
};

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
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      state.products = state.products.map(p => p.id === action.payload.id ? action.payload : p);
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    loginUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
    setPriceTier: (state, action: PayloadAction<"all" | "premium" | "simple">) => {
      state.priceTier = action.payload;
    },
    createOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      state.orders = state.orders.map(o => o.id === action.payload.id ? { ...o, status: action.payload.status } : o);
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(o => o.id !== action.payload);
    }
  }
});

export const {
  addToCart,
  updateQty,
  removeFromCart,
  toggleWishlist,
  viewProduct,
  toggleDarkMode,
  clearCart,
  setProducts,
  setOrders,
  addProduct,
  updateProduct,
  deleteProduct,
  loginUser,
  logoutUser,
  setPriceTier,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = commerceSlice.actions;

export const store = configureStore({ reducer: { commerce: commerceSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

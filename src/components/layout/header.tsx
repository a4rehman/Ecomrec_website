"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleDarkMode, logoutUser } from "@/store/store";
import { categories } from "@/data/products";
import { CollectionSwitcher } from "./collection-switcher";

export function Header() {
  const [open, setOpen] = useState(false);
  const { cart, wishlist, darkMode, user } = useSelector((s: RootState) => s.commerce);
  const dispatch = useDispatch();
  return (
    <>
      <div className="h-10 bg-[#191919] text-white">
        <div className="container-lux flex h-full items-center justify-center text-[10px] font-bold tracking-[.22em] uppercase">FREE SHIPPING IN PAKISTAN · GLOBAL EXPRESS SHIPPING OVER $350</div>
      </div>
      <CollectionSwitcher />
      <header className="sticky top-0 z-40 border-b border-line bg-background/88 backdrop-blur-xl">
        <div className="container-lux grid h-24 grid-cols-3 items-center">
          <button onClick={() => setOpen(true)} className="focus-ring flex items-center gap-3 justify-self-start text-sm uppercase tracking-wide">
            <Menu size={30} strokeWidth={1.6} /> Menu
          </button>
          <Link href="/" className="justify-self-center text-center">
            <span className="block font-serif text-4xl tracking-[.28em]">JAHANARA</span>
            <span className="tracked-luxury block text-[10px] text-muted">Couture</span>
          </Link>
          <nav className="flex items-center gap-5 justify-self-end">
            <Link className="hidden sm:block" href="/shop"><Search strokeWidth={1.7} /></Link>
            {user ? (
              <div className="hidden sm:flex items-center gap-3 text-xs tracking-wider uppercase font-medium">
                <span className="text-muted">Hi, {user.name.split(" ")[0]}</span>
                {user.role === "admin" && (
                  <Link href="/admin" className="text-accent border border-accent/40 rounded px-2.5 py-1.5 text-[10px] font-bold hover:bg-accent hover:text-white transition">
                    Admin
                  </Link>
                )}
                <button onClick={() => dispatch(logoutUser())} className="text-muted hover:text-foreground text-[10px] underline cursor-pointer">
                  Logout
                </button>
              </div>
            ) : (
              <Link className="hidden sm:block" href="/login"><User strokeWidth={1.7} /></Link>
            )}
            <Link className="relative hidden sm:block" href="/wishlist"><Heart strokeWidth={1.7} />{wishlist.length > 0 && <b className="absolute -right-2 -top-2 text-[10px]">{wishlist.length}</b>}</Link>
            <Link className="relative" href="/cart"><ShoppingBag strokeWidth={1.7} />{cart.length > 0 && <b className="absolute -right-2 -top-2 text-[10px]">{cart.length}</b>}</Link>
            <button className="focus-ring" onClick={() => dispatch(toggleDarkMode())} aria-label="Toggle dark mode">{darkMode ? <Sun strokeWidth={1.7} /> : <Moon strokeWidth={1.7} />}</button>
          </nav>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/35" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="fixed left-0 top-0 z-50 h-dvh w-[min(480px,92vw)] overflow-y-auto bg-background p-9 shadow-2xl" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <button onClick={() => setOpen(false)} className="focus-ring mb-10"><X size={28} strokeWidth={1.4} /></button>
              <div className="space-y-0">
                {categories.map((cat, i) => (
                  <Link key={cat} href={`/shop?category=${encodeURIComponent(cat.replace("'26", "").trim())}`} onClick={() => setOpen(false)} className="group flex min-h-20 items-center justify-between border-b border-line text-base tracking-[.28em] uppercase">
                    <span className={cat === "Sale" ? "text-red-600" : ""}>{cat}</span>
                    {i === 0 && <span className="bg-rose-400 px-2 py-1 text-[10px] font-bold tracking-widest text-white">NEW</span>}
                  </Link>
                ))}
              </div>
              <div className="mt-8 border-t border-line pt-6 flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="text-xs uppercase tracking-wider font-semibold text-muted">Hi, {user.name}</div>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setOpen(false)} className="text-accent text-sm uppercase tracking-wider font-medium">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { dispatch(logoutUser()); setOpen(false); }} className="text-left text-sm uppercase tracking-wider text-muted font-medium hover:text-foreground cursor-pointer">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="text-sm uppercase tracking-wider font-medium flex items-center gap-2">
                    <User size={16} /> Login / Sign Up
                  </Link>
                )}
                <Link href="/wishlist" onClick={() => setOpen(false)} className="text-sm uppercase tracking-wider font-medium flex items-center gap-2">
                  <Heart size={16} /> Wishlist ({wishlist.length})
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

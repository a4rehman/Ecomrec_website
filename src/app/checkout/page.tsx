"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, ShoppingBag, Truck } from "lucide-react";
import { RootState, clearCart } from "@/store/store";
import { CartClient } from "@/components/commerce/cart-client";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { cart, products } = useSelector((s: RootState) => s.commerce);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [payMethod, setPayMethod] = useState("cod");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [error, setError] = useState("");

  const subtotal = cart.reduce((acc, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return acc + (p ? p.price * item.qty : 0);
  }, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!name || !address || !city || !zip || !phone) {
      setError("Please fill in all shipping details.");
      return;
    }

    if (payMethod === "card" && (!cardNum || !cardExp || !cardCvc)) {
      setError("Please fill in all credit card details.");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: subtotal, name, address, city, zip, phone, payMethod })
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(clearCart());
        setGeneratedId(data.orderId);
        setOrderPlaced(true);
      } else {
        setError("Failed to create order: " + data.error);
      }
    } catch {
      setError("Network error while placing order.");
    }
  };

  if (orderPlaced) {
    return (
      <section className="container-lux max-w-2xl py-24 text-center">
        <BrandLogo className="mb-8" imageClassName="w-56" showTagline />
        <div className="mb-6 flex justify-center">
          <CheckCircle2 size={80} className="animate-bounce text-accent" />
        </div>
        <h1 className="mb-4 font-serif text-5xl">Order Placed Successfully!</h1>
        <p className="mb-6 text-xl font-medium uppercase tracking-wide text-accent">Order ID: #{generatedId}</p>

        <div className="glass mb-10 rounded-[28px] border border-line p-8 text-left leading-8 text-muted">
          <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Truck size={18} className="text-accent" /> Shipment Details:
          </p>
          <p>- <b>Recipient:</b> {name}</p>
          <p>- <b>Delivery Address:</b> {address}, {city}, {zip}</p>
          <p>- <b>Phone Number:</b> {phone}</p>
          <p>- <b>Payment Method:</b> {payMethod === "cod" ? "Cash on Delivery" : "Prepaid Credit Card"}</p>
          <p>- <b>Grand Total:</b> {formatPrice(subtotal)} (Free Shipping)</p>

          {payMethod === "cod" && (
            <div className="mt-6 rounded-3xl border border-accent/20 bg-accent/10 p-4 text-xs leading-5 text-foreground">
              <b>Cash on Delivery Note:</b> Since you selected COD, our team will call/SMS you on <b>{phone}</b> to confirm this order. Your package will ship once confirmed and reach you within 2-4 business days.
            </div>
          )}
        </div>

        <Link href="/shop">
          <Button className="px-8 py-3">
            <ShoppingBag size={16} className="mr-2" /> Continue Shopping
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container-lux py-14">
      <div className="mb-10 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <BrandLogo className="mb-5 items-start" imageClassName="w-48" showTagline />
          <h1 className="font-serif text-6xl">Checkout</h1>
        </div>
        <p className="max-w-md leading-7 text-muted">A secure final step for your Sawera pieces, prepared with care and graceful attention.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="premium-surface grid gap-4 p-6" onSubmit={handlePlaceOrder}>
          <h2 className="tracked-luxury mb-2 text-sm">Shipping Address</h2>
          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input placeholder="ZIP code" value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
          <Input placeholder="Phone number (e.g. 03XXXXXXXXX)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <h2 className="tracked-luxury mb-2 mt-6 text-sm">Payment Method</h2>
          <div className="grid gap-3 rounded-3xl border border-line bg-background/50 p-4">
            <label className="flex cursor-pointer items-center gap-2.5 py-1">
              <input type="radio" name="pay" checked={payMethod === "cod"} onChange={() => setPayMethod("cod")} className="accent-[var(--accent)]" />
              <div>
                <span className="font-medium">Cash on Delivery (COD)</span>
                <span className="block text-xs text-muted">Pay in cash when your package is delivered. Free delivery.</span>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 border-t border-line/40 pt-3">
              <input type="radio" name="pay" checked={payMethod === "card"} onChange={() => setPayMethod("card")} className="accent-[var(--accent)]" />
              <div>
                <span className="font-medium">Credit / Debit Card</span>
                <span className="block text-xs text-muted">Pay securely online using Visa, Mastercard, or UnionPay.</span>
              </div>
            </label>
          </div>

          {payMethod === "card" && (
            <div className="mt-4 grid gap-4 rounded-3xl border border-line bg-background/50 p-4">
              <h3 className="tracked-luxury text-xs text-accent">Card Details</h3>
              <Input placeholder="Card number" value={cardNum} onChange={(e) => setCardNum(e.target.value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="MM/YY" value={cardExp} onChange={(e) => setCardExp(e.target.value)} />
                <Input placeholder="CVC" value={cardCvc} type="password" maxLength={4} onChange={(e) => setCardCvc(e.target.value)} />
              </div>
            </div>
          )}

          <Button type="submit" className="mt-6 w-full py-4 text-base">
            Place Order
          </Button>
        </form>

        <div>
          <CartClient checkout />
        </div>
      </div>
    </section>
  );
}

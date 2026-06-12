"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, clearCart, createOrder } from "@/store/store";
import { CartClient } from "@/components/commerce/cart-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Truck } from "lucide-react";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { cart, products } = useSelector((s: RootState) => s.commerce);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [payMethod, setPayMethod] = useState("cod"); // default to COD

  // Card details states
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

  const handlePlaceOrder = (e: React.FormEvent) => {
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

    const orderId = `JHN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      items: cart,
      total: subtotal,
      name,
      address,
      city,
      zip,
      phone,
      date: new Date().toLocaleDateString(),
      status: "Processing"
    };

    dispatch(createOrder(newOrder));
    dispatch(clearCart());
    setGeneratedId(orderId);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <section className="container-lux py-24 max-w-2xl text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={80} className="text-green-600 animate-bounce" />
        </div>
        <h1 className="font-serif text-5xl mb-4">Order Placed Successfully!</h1>
        <p className="text-xl font-medium tracking-wide text-accent uppercase mb-6">
          Order ID: #{generatedId}
        </p>
        
        <div className="glass p-8 rounded text-left border border-line mb-10 leading-8 text-muted">
          <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Truck size={18} className="text-accent" /> Shipment Details:
          </p>
          <p>• <b>Recipient:</b> {name}</p>
          <p>• <b>Delivery Address:</b> {address}, {city}, {zip}</p>
          <p>• <b>Phone Number:</b> {phone}</p>
          <p>• <b>Payment Method:</b> {payMethod === "cod" ? "Cash on Delivery" : "Prepaid Credit Card"}</p>
          <p>• <b>Grand Total:</b> {formatPrice(subtotal)} (Free Shipping)</p>
          
          {payMethod === "cod" && (
            <div className="mt-6 p-4 bg-accent/10 border border-accent/20 text-foreground text-xs leading-5">
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
      <h1 className="mb-10 font-serif text-6xl">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="grid gap-4" onSubmit={handlePlaceOrder}>
          <h2 className="tracked-luxury mb-2 text-sm">Shipping Address</h2>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
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

          <h2 className="tracked-luxury mt-6 mb-2 text-sm">Payment Method</h2>
          <div className="grid gap-3 border border-line p-4 bg-background/50 rounded">
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input
                type="radio"
                name="pay"
                checked={payMethod === "cod"}
                onChange={() => setPayMethod("cod")}
                className="accent-[var(--accent)]"
              />
              <div>
                <span className="font-medium">Cash on Delivery (COD)</span>
                <span className="block text-xs text-muted">Pay in cash when package is delivered to your doorstep. Free delivery!</span>
              </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer py-1 border-t border-line/40 pt-3">
              <input
                type="radio"
                name="pay"
                checked={payMethod === "card"}
                onChange={() => setPayMethod("card")}
                className="accent-[var(--accent)]"
              />
              <div>
                <span className="font-medium">Credit / Debit Card</span>
                <span className="block text-xs text-muted">Pay securely online using Visa, Mastercard, or UnionPay.</span>
              </div>
            </label>
          </div>

          {payMethod === "card" && (
            <div className="mt-4 p-4 border border-line rounded bg-background/50 grid gap-4">
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

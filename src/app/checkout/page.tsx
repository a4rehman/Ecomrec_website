import { CartClient } from "@/components/commerce/cart-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  return <section className="container-lux py-14"><h1 className="mb-10 font-serif text-6xl">Checkout</h1><div className="grid gap-10 lg:grid-cols-[1fr_1fr]"><form className="grid gap-4"><h2 className="tracked-luxury mb-2 text-sm">Shipping Address</h2><Input placeholder="Full name" /><Input placeholder="Address" /><div className="grid gap-4 sm:grid-cols-2"><Input placeholder="City" /><Input placeholder="ZIP code" /></div><h2 className="tracked-luxury mt-6 text-sm">Billing Details</h2><Input placeholder="Card number" /><div className="grid gap-4 sm:grid-cols-2"><Input placeholder="MM/YY" /><Input placeholder="CVC" /></div><div className="grid gap-3 border border-line p-4"><label><input type="radio" defaultChecked name="pay" /> Credit card</label><label><input type="radio" name="pay" /> Cash on delivery</label><label><input type="radio" name="pay" /> PayPal</label></div><Button>Place Order</Button></form><CartClient checkout /></div></section>;
}

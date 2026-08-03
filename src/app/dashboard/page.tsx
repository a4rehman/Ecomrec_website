"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { 
  Package, ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, User as UserIcon, MapPin, Mail, Phone, ArrowRight 
} from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  qty: number;
  size?: string;
  color?: string;
  price: number;
};

type Order = {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  total: number;
  status: string;
  date: string;
  method: string;
  items: OrderItem[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.commerce);

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    // Read logged in user from localStorage or Redux store
    const storedUser = localStorage.getItem("jahanara_user");
    let activeUser = user;

    if (!activeUser && storedUser) {
      try {
        activeUser = JSON.parse(storedUser);
      } catch (e) {
        console.error(e);
      }
    }

    if (!activeUser) {
      router.push("/login");
      return;
    }

    setCurrentUser(activeUser);

    // Fetch user orders from DB by email
    fetch(`/api/orders?email=${encodeURIComponent(activeUser.email)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error("Error loading user orders:", err))
      .finally(() => setLoading(false));
  }, [user, router]);

  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 size={14} /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Truck size={14} /> Shipped / In Transit
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle size={14} /> Cancelled
          </span>
        );
      case "processing":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock size={14} /> Processing
          </span>
        );
    }
  };

  const getStepProgress = (status: string) => {
    const s = status.toLowerCase();
    if (s === "cancelled") return 0;
    if (s === "delivered" || s === "completed") return 100;
    if (s === "shipped") return 66;
    return 33; // processing
  };

  if (loading) {
    return (
      <section className="container-lux py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted text-sm">Loading your account details...</p>
      </section>
    );
  }

  return (
    <section className="container-lux py-14">
      {/* Header Greeting */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal">My Account</h1>
          <p className="text-muted text-sm mt-1">Welcome back, <span className="font-semibold text-foreground">{currentUser?.name}</span></p>
        </div>
        <Link href="/shop">
          <Button variant="outline" className="gap-2 text-xs">
            <ShoppingBag size={15} /> Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="glass p-6 border border-line rounded-lg">
          <div className="flex items-center gap-3 text-accent mb-2">
            <Package size={22} />
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders</span>
          </div>
          <p className="font-serif text-3xl font-bold">{orders.length}</p>
        </div>

        <div className="glass p-6 border border-line rounded-lg">
          <div className="flex items-center gap-3 text-accent mb-2">
            <ShoppingBag size={22} />
            <span className="text-xs uppercase tracking-wider font-semibold">Total Spent</span>
          </div>
          <p className="font-serif text-3xl font-bold">{formatPrice(totalSpent)}</p>
        </div>

        <div className="glass p-6 border border-line rounded-lg">
          <div className="flex items-center gap-3 text-accent mb-2">
            <UserIcon size={22} />
            <span className="text-xs uppercase tracking-wider font-semibold">Account Email</span>
          </div>
          <p className="text-sm font-medium truncate">{currentUser?.email}</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Nav */}
        <aside className="glass p-4 border border-line rounded-lg h-fit space-y-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-between transition ${
              activeTab === "orders" ? "bg-accent text-accent-foreground" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <span>My Orders ({orders.length})</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-between transition ${
              activeTab === "profile" ? "bg-accent text-accent-foreground" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <span>Profile Details</span>
            <ArrowRight size={14} />
          </button>
        </aside>

        {/* Tab Content */}
        <div>
          {activeTab === "orders" ? (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl mb-4">Order History & Status Tracking</h2>

              {orders.length === 0 ? (
                <div className="glass border border-line p-12 text-center rounded-lg">
                  <Package size={48} className="mx-auto text-muted mb-4 opacity-50" />
                  <h3 className="font-serif text-xl mb-2">No orders placed yet</h3>
                  <p className="text-muted text-sm mb-6">Explore our latest luxury lawn and formal collections today.</p>
                  <Link href="/shop">
                    <Button>Shop Now</Button>
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const progress = getStepProgress(order.status);
                  return (
                    <div key={order.id} className="glass border border-line rounded-lg overflow-hidden p-6 space-y-6">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-xl font-bold text-accent">#{order.id}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-muted mt-1">Placed on {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wider text-muted">Total Amount</p>
                          <p className="font-serif text-xl font-bold">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      {/* Status Tracker Bar */}
                      {order.status.toLowerCase() !== "cancelled" && (
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded border border-line/60">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                            Order Status Progress:
                          </p>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden mb-3">
                            <div
                              className="bg-accent h-full transition-all duration-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="grid grid-cols-3 text-center text-[11px] font-medium text-muted">
                            <div className={progress >= 33 ? "text-accent font-bold" : ""}>1. Order Placed</div>
                            <div className={progress >= 66 ? "text-accent font-bold" : ""}>2. Shipped</div>
                            <div className={progress >= 100 ? "text-emerald-600 font-bold" : ""}>3. Delivered</div>
                          </div>
                        </div>
                      )}

                      {/* Items Ordered List */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                          Items in this Order ({order.items.length}):
                        </p>
                        <div className="divide-y divide-line/40">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted">
                                  {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`} | Qty: {item.qty}
                                </p>
                              </div>
                              <p className="font-semibold text-xs">{formatPrice(item.price * item.qty)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Contact Info */}
                      <div className="pt-3 border-t border-line/40 flex flex-wrap justify-between gap-4 text-xs text-muted">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-accent" />
                          <span><b>Delivery Address:</b> {order.address}, {order.city}, {order.zip}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-accent" />
                          <span><b>Contact Phone:</b> {order.phone}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="glass border border-line p-8 rounded-lg space-y-6">
              <h2 className="font-serif text-2xl">Profile & Contact Information</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded">
                  <UserIcon className="text-accent" size={20} />
                  <div>
                    <p className="text-xs text-muted">Full Name</p>
                    <p className="font-semibold">{currentUser?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded">
                  <Mail className="text-accent" size={20} />
                  <div>
                    <p className="text-xs text-muted">Email Address</p>
                    <p className="font-semibold">{currentUser?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

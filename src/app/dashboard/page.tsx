"use client";

import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, addToCart, toggleWishlist, logoutUser } from "@/store/store";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { 
  Package, ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, User as UserIcon, MapPin, Mail, Phone, ArrowRight,
  Search, Bell, Heart, Shield, LogOut, Printer, RefreshCw, X,
  Check, FileText, Calendar, Filter
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
  createdAt?: string;
  items: OrderItem[];
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

type TabType = "overview" | "orders" | "track" | "wishlist" | "addresses" | "notifications" | "profile";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, wishlist, products } = useSelector((s: RootState) => s.commerce);

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    zip?: string;
  } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Orders Tab filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected Order for Modal / Detailed Track
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Profile Form States
  const [profName, setProfName] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profAddress, setProfAddress] = useState("");
  const [profCity, setProfCity] = useState("");
  const [profZip, setProfZip] = useState("");
  const [profileMsg, setProfileMsg] = useState({ text: "", error: false });

  // Change Password Form States
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState({ text: "", error: false });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 1. Initial Authentication & Profile Load
  useEffect(() => {
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
    setProfName(activeUser.name || "");

    // Fetch complete user profile from Hostinger MySQL DB
    fetch(`/api/user/profile?email=${encodeURIComponent(activeUser.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.user) {
          setCurrentUser(data.user);
          setProfName(data.user.name || "");
          setProfPhone(data.user.phone || "");
          setProfAddress(data.user.address || "");
          setProfCity(data.user.city || "");
          setProfZip(data.user.zip || "");
        }
      })
      .catch((err) => console.error("Error loading user profile:", err));
  }, [user, router]);

  // 2. Fetch User Orders & Auto-Poll Every 8 Seconds (Real-time Sync with Admin Changes)
  const fetchUserOrders = (email: string) => {
    fetch(`/api/orders?email=${encodeURIComponent(email)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.orders) {
          const freshOrders: Order[] = data.orders;
          setOrders(freshOrders);

          // Generate notifications based on order status
          const generatedNotifs: NotificationItem[] = freshOrders.map((o) => ({
            id: `notif-${o.id}-${o.status}`,
            title: `Order #${o.id} - ${o.status}`,
            message: `Your order #${o.id} is currently ${o.status.toLowerCase()}. ${
              o.status === "Shipped"
                ? "Parcel has been dispatched via courier."
                : o.status === "Delivered"
                ? "Item delivered successfully. Thank you for shopping with us!"
                : o.status === "Cancelled"
                ? "Order has been cancelled."
                : "Our fulfillment team is preparing your package."
            }`,
            date: o.date,
            read: false,
            type: o.status === "Delivered" ? "success" : o.status === "Cancelled" ? "warning" : "info"
          }));

          setNotifications(generatedNotifs);

          // If tracking order is open, update selectedOrder with fresh data
          if (selectedOrder) {
            const updated = freshOrders.find((x) => x.id === selectedOrder.id);
            if (updated) setSelectedOrder(updated);
          }
        }
      })
      .catch((err) => console.error("Error loading user orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!currentUser?.email) return;

    fetchUserOrders(currentUser.email);

    // Setup 8s polling timer for live status updates from Admin Panel
    const interval = setInterval(() => {
      fetchUserOrders(currentUser.email);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentUser?.email]);

  // Derived Summary Metrics
  const totalSpent = useMemo(() => orders.reduce((acc, o) => acc + o.total, 0), [orders]);
  const processingCount = useMemo(() => orders.filter((o) => o.status.toLowerCase() === "processing").length, [orders]);
  const shippedCount = useMemo(() => orders.filter((o) => o.status.toLowerCase() === "shipped").length, [orders]);
  const deliveredCount = useMemo(() => orders.filter((o) => o.status.toLowerCase() === "delivered" || o.status.toLowerCase() === "completed").length, [orders]);
  const cancelledCount = useMemo(() => orders.filter((o) => o.status.toLowerCase() === "cancelled").length, [orders]);
  const unreadNotifsCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Filtered Orders for My Orders Tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "All" || o.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Wishlist Items
  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Handlers
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    setProfileMsg({ text: "", error: false });
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          name: profName,
          phone: profPhone,
          address: profAddress,
          city: profCity,
          zip: profZip
        })
      });
      const data = await res.json();
      if (data.ok) {
        setProfileMsg({ text: "Profile details updated successfully!", error: false });
        setCurrentUser(data.user);
        localStorage.setItem("jahanara_user", JSON.stringify(data.user));
      } else {
        setProfileMsg({ text: data.message || "Failed to update profile", error: true });
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || "Failed to update profile", error: true });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    setPassMsg({ text: "", error: false });

    if (newPass !== confirmPass) {
      setPassMsg({ text: "New passwords do not match", error: true });
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          currentPassword: currentPass,
          newPassword: newPass
        })
      });
      const data = await res.json();
      if (data.ok) {
        setPassMsg({ text: "Password updated successfully!", error: false });
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setPassMsg({ text: data.message || "Failed to change password", error: true });
      }
    } catch (err: any) {
      setPassMsg({ text: err.message || "Failed to change password", error: true });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" })
      });
      const data = await res.json();
      if (data.ok) {
        fetchUserOrders(currentUser!.email);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jahanara_user");
    dispatch(logoutUser());
    router.push("/login");
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Helper Badge Renderers
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "delivered" || s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={13} /> Delivered
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <Truck size={13} /> Shipped
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <XCircle size={13} /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <Clock size={13} /> Processing
      </span>
    );
  };

  const getTimelineSteps = (status: string) => {
    const s = status.toLowerCase();
    let currentStep = 1;
    if (s === "cancelled") currentStep = 0;
    else if (s === "shipped") currentStep = 4;
    else if (s === "delivered" || s === "completed") currentStep = 5;
    else currentStep = 3; // Processing

    const steps = [
      { id: 1, title: "Order Placed", desc: "Order details received" },
      { id: 2, title: "Confirmed", desc: "COD verification complete" },
      { id: 3, title: "Processing", desc: "Inspecting & packing suit" },
      { id: 4, title: "Shipped", desc: "Handed over to courier" },
      { id: 5, title: "Delivered", desc: "Parcel delivered" }
    ];

    return { steps, currentStep };
  };

  if (loading) {
    return (
      <section className="container-lux py-24 text-center">
        <div className="animate-spin w-9 h-9 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted text-sm font-medium">Loading your luxury dashboard...</p>
      </section>
    );
  }

  return (
    <section className="container-lux py-10 md:py-14">
      {/* Top Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Sawera Atelier</span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal mt-1">Customer Dashboard</h1>
          <p className="text-muted text-xs md:text-sm mt-1">
            Logged in as <span className="font-semibold text-foreground">{currentUser?.name}</span> ({currentUser?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/shop">
            <Button variant="outline" className="gap-2 text-xs">
              <ShoppingBag size={14} /> Shop Suits
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="outline" className="gap-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40">
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tab Content */}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        
        {/* Luxury Sidebar Navigation */}
        <aside className="glass p-4 border border-line rounded-lg h-fit space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold px-3 py-2">Account Navigation</p>
          
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "overview" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package size={16} /> Overview
            </div>
            <ArrowRight size={13} className="opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "orders" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={16} /> My Orders
            </div>
            <span className="text-[11px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("track")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "track" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck size={16} /> Track Orders
            </div>
            <ArrowRight size={13} className="opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "wishlist" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart size={16} /> Wishlist
            </div>
            <span className="text-[11px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full font-bold">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "notifications" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell size={16} /> Notifications
            </div>
            {unreadNotifsCount > 0 && (
              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "addresses" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin size={16} /> Saved Addresses
            </div>
            <ArrowRight size={13} className="opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-md flex items-center justify-between transition ${
              activeTab === "profile" ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield size={16} /> Profile & Security
            </div>
            <ArrowRight size={13} className="opacity-60" />
          </button>
        </aside>

        {/* Dynamic Content Pane */}
        <div>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Summary Cards Row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass p-5 border border-line rounded-lg">
                  <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Total Orders</p>
                  <p className="font-serif text-3xl font-bold mt-2">{orders.length}</p>
                  <p className="text-xs text-accent mt-1">Total Spent: {formatPrice(totalSpent)}</p>
                </div>

                <div className="glass p-5 border border-line rounded-lg">
                  <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Processing</p>
                  <p className="font-serif text-3xl font-bold text-amber-600 mt-2">{processingCount}</p>
                  <p className="text-xs text-muted mt-1">In fulfillment queue</p>
                </div>

                <div className="glass p-5 border border-line rounded-lg">
                  <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">In Transit</p>
                  <p className="font-serif text-3xl font-bold text-blue-600 mt-2">{shippedCount}</p>
                  <p className="text-xs text-muted mt-1">On the way via courier</p>
                </div>

                <div className="glass p-5 border border-line rounded-lg">
                  <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Delivered</p>
                  <p className="font-serif text-3xl font-bold text-emerald-600 mt-2">{deliveredCount}</p>
                  <p className="text-xs text-muted mt-1">Successfully received</p>
                </div>
              </div>

              {/* Quick Recent Orders Preview */}
              <div className="glass border border-line rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl">Recent Orders</h2>
                  <Button onClick={() => setActiveTab("orders")} variant="ghost" className="text-xs gap-1">
                    View All Orders <ArrowRight size={14} />
                  </Button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 text-muted">
                    <Package size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-line/60">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-lg font-bold text-accent">#{o.id}</span>
                            {getStatusBadge(o.status)}
                          </div>
                          <p className="text-xs text-muted mt-1">Date: {o.date} | Items: {o.items.length} pcs | Total: {formatPrice(o.total)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => { setSelectedOrder(o); setActiveTab("track"); }} 
                            variant="outline" 
                            className="text-xs py-1.5 h-auto gap-1"
                          >
                            <Truck size={13} /> Track
                          </Button>
                          <Button 
                            onClick={() => setInvoiceOrder(o)} 
                            variant="outline" 
                            className="text-xs py-1.5 h-auto gap-1"
                          >
                            <FileText size={13} /> Invoice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-serif text-2xl">My Purchase History</h2>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search size={15} className="absolute left-3 top-3 text-muted" />
                    <Input 
                      placeholder="Search order ID..." 
                      className="pl-9 text-xs" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
                {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      statusFilter === st 
                        ? "bg-accent text-accent-foreground font-semibold" 
                        : "bg-neutral-100 dark:bg-neutral-900 text-muted hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Filtered Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="glass border border-line p-12 text-center rounded-lg">
                  <Package size={44} className="mx-auto text-muted mb-3 opacity-40" />
                  <h3 className="font-serif text-xl mb-1">No orders found</h3>
                  <p className="text-muted text-xs">Try adjusting your search query or status filter.</p>
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div key={o.id} className="glass border border-line rounded-lg p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-xl font-bold text-accent">#{o.id}</span>
                          {getStatusBadge(o.status)}
                        </div>
                        <p className="text-xs text-muted mt-1">Placed on {o.date} · Cash on Delivery</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          <p className="text-[10px] uppercase tracking-wider text-muted">Total Amount</p>
                          <p className="font-serif text-lg font-bold">{formatPrice(o.total)}</p>
                        </div>
                        <Button 
                          onClick={() => { setSelectedOrder(o); setActiveTab("track"); }} 
                          variant="outline" 
                          className="text-xs gap-1"
                        >
                          <Truck size={14} /> Track Order
                        </Button>
                        <Button 
                          onClick={() => setInvoiceOrder(o)} 
                          variant="outline" 
                          className="text-xs gap-1"
                        >
                          <FileText size={14} /> Invoice
                        </Button>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3">
                      <p className="text-[11px] uppercase tracking-wider text-muted font-bold">Ordered Items ({o.items.length}):</p>
                      <div className="divide-y divide-line/40">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-muted">
                                {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`} | Quantity: {item.qty}
                              </p>
                            </div>
                            <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping info & Cancel Order button */}
                    <div className="pt-3 border-t border-line/40 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <p className="text-muted"><b>Ship to:</b> {o.name} ({o.address}, {o.city})</p>
                      
                      {o.status.toLowerCase() === "processing" && (
                        <Button 
                          onClick={() => handleCancelOrder(o.id)}
                          variant="ghost" 
                          className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-1 h-auto"
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: TRACK ORDERS */}
          {activeTab === "track" && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl mb-2">Live Order Tracking</h2>

              {/* Order Selector */}
              {orders.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-line">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Select Order to Track:</span>
                  <select 
                    value={selectedOrder ? selectedOrder.id : orders[0].id}
                    onChange={(e) => {
                      const found = orders.find((o) => o.id === e.target.value);
                      if (found) setSelectedOrder(found);
                    }}
                    className="bg-background border border-line rounded px-3 py-1.5 text-xs font-medium outline-none cursor-pointer"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id} - {o.date} ({o.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selected Order Detailed Tracking Panel */}
              {(() => {
                const orderToTrack = selectedOrder || orders[0];
                if (!orderToTrack) {
                  return (
                    <div className="glass border border-line p-12 text-center rounded-lg text-muted">
                      No order selected for tracking.
                    </div>
                  );
                }

                const { steps, currentStep } = getTimelineSteps(orderToTrack.status);
                const isCancelled = orderToTrack.status.toLowerCase() === "cancelled";

                return (
                  <div className="glass border border-line rounded-lg p-6 md:p-8 space-y-8">
                    {/* Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-2xl font-bold text-accent">Order #{orderToTrack.id}</span>
                          {getStatusBadge(orderToTrack.status)}
                        </div>
                        <p className="text-xs text-muted mt-1">Placed on {orderToTrack.date} · Free Express Courier Delivery</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider text-muted">Estimated Delivery</p>
                        <p className="font-semibold text-sm text-foreground">Within 2–4 Business Days</p>
                      </div>
                    </div>

                    {/* Timeline Visual Progress Bar */}
                    {isCancelled ? (
                      <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-700 rounded-lg text-center">
                        <XCircle size={36} className="mx-auto mb-2 text-rose-600" />
                        <h4 className="font-serif text-xl mb-1">Order Cancelled</h4>
                        <p className="text-xs text-muted">This order was cancelled and will not be shipped.</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="relative flex items-center justify-between max-w-2xl mx-auto mb-8">
                          {/* Background Connecting Line */}
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 z-0"></div>
                          <div 
                            className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 transition-all duration-700 z-0"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                          ></div>

                          {/* Step Dots */}
                          {steps.map((st) => {
                            const isPassed = st.id <= currentStep;
                            const isCurrent = st.id === currentStep;

                            return (
                              <div key={st.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                                  isPassed 
                                    ? "bg-accent text-accent-foreground shadow-md" 
                                    : "bg-background border-2 border-line text-muted"
                                } ${isCurrent ? "ring-4 ring-accent/30 animate-pulse" : ""}`}>
                                  {isPassed ? <Check size={16} /> : st.id}
                                </div>
                                <span className={`text-[11px] font-semibold mt-2 ${isPassed ? "text-foreground" : "text-muted"}`}>
                                  {st.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address & Products */}
                    <div className="grid gap-6 md:grid-cols-2 border-t border-line/60 pt-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Shipping Destination:</p>
                        <p className="text-sm font-medium">{orderToTrack.name}</p>
                        <p className="text-xs text-muted">{orderToTrack.address}, {orderToTrack.city}, {orderToTrack.zip}</p>
                        <p className="text-xs text-muted">Phone: {orderToTrack.phone}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Payment Information:</p>
                        <p className="text-sm font-medium">Cash on Delivery (COD)</p>
                        <p className="text-xs text-muted">Total Payable: <b>{formatPrice(orderToTrack.total)}</b></p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl">My Saved Wishlist ({wishlistProducts.length})</h2>

              {wishlistProducts.length === 0 ? (
                <div className="glass border border-line p-12 text-center rounded-lg">
                  <Heart size={44} className="mx-auto text-muted mb-3 opacity-40" />
                  <h3 className="font-serif text-xl mb-1">Your wishlist is empty</h3>
                  <p className="text-muted text-xs mb-6">Save your favorite luxury suits to view them here anytime.</p>
                  <Link href="/shop">
                    <Button>Browse Collections</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="glass border border-line rounded-lg overflow-hidden flex flex-col justify-between">
                      <div className="relative aspect-[3/4] bg-neutral-100">
                        {p.images && p.images[0] && (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        )}
                        <button
                          onClick={() => dispatch(toggleWishlist(p.id))}
                          className="absolute top-2 right-2 p-2 bg-background/80 rounded-full text-rose-600 hover:scale-110 transition"
                          title="Remove from wishlist"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="p-4 space-y-3">
                        <h4 className="font-medium text-sm truncate">{p.name}</h4>
                        <p className="text-xs font-bold text-accent">{formatPrice(p.price)}</p>
                        <Button 
                          onClick={() => {
                            dispatch(addToCart({ id: p.id, qty: 1, size: "Unstitched" }));
                            dispatch(toggleWishlist(p.id));
                          }}
                          className="w-full text-xs gap-2" 
                        >
                          <ShoppingBag size={14} /> Move to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl">Notifications Center</h2>
                {unreadNotifsCount > 0 && (
                  <Button onClick={markAllNotificationsRead} variant="outline" className="text-xs">
                    Mark All as Read
                  </Button>
                )}
              </div>

              <div className="glass border border-line rounded-lg p-6 divide-y divide-line/60">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted py-8 text-xs">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">{n.title}</p>
                        <p className="text-xs text-muted">{n.message}</p>
                        <p className="text-[10px] text-muted">{n.date}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="glass border border-line p-8 rounded-lg space-y-6">
              <h2 className="font-serif text-2xl">Saved Delivery Address</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase">Street Address</label>
                  <Input 
                    value={profAddress} 
                    onChange={(e) => setProfAddress(e.target.value)} 
                    placeholder="e.g. House #12, Street 4, Cavalry Ground"
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">City</label>
                    <Input 
                      value={profCity} 
                      onChange={(e) => setProfCity(e.target.value)} 
                      placeholder="Lahore"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Postal Code / Zip</label>
                    <Input 
                      value={profZip} 
                      onChange={(e) => setProfZip(e.target.value)} 
                      placeholder="54810"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" className="text-xs mt-2">Save Address</Button>
              </form>
            </div>
          )}

          {/* TAB 7: PROFILE & SECURITY */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Profile Details Form */}
              <div className="glass border border-line p-8 rounded-lg space-y-6">
                <h2 className="font-serif text-2xl">Personal Information</h2>

                {profileMsg.text && (
                  <p className={`text-xs p-3 rounded ${profileMsg.error ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {profileMsg.text}
                  </p>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Full Name</label>
                    <Input 
                      value={profName} 
                      onChange={(e) => setProfName(e.target.value)} 
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Email Address (Read-only)</label>
                    <Input 
                      value={currentUser?.email || ""} 
                      disabled 
                      className="mt-1 text-xs bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Phone Number</label>
                    <Input 
                      value={profPhone} 
                      onChange={(e) => setProfPhone(e.target.value)} 
                      placeholder="03001234567"
                      className="mt-1 text-xs"
                    />
                  </div>

                  <Button type="submit" className="text-xs">Update Profile</Button>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="glass border border-line p-8 rounded-lg space-y-6">
                <h2 className="font-serif text-2xl">Change Password</h2>

                {passMsg.text && (
                  <p className={`text-xs p-3 rounded ${passMsg.error ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {passMsg.text}
                  </p>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Current Password</label>
                    <Input 
                      type="password"
                      value={currentPass} 
                      onChange={(e) => setCurrentPass(e.target.value)} 
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">New Password</label>
                    <Input 
                      type="password"
                      value={newPass} 
                      onChange={(e) => setNewPass(e.target.value)} 
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted uppercase">Confirm New Password</label>
                    <Input 
                      type="password"
                      value={confirmPass} 
                      onChange={(e) => setConfirmPass(e.target.value)} 
                      className="mt-1 text-xs"
                    />
                  </div>

                  <Button type="submit" className="text-xs">Update Password</Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LUXURY INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-line rounded-lg max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-serif text-2xl">Sawera Collection</h3>
                <p className="text-[10px] uppercase tracking-widest text-muted">Official Purchase Invoice</p>
              </div>
              <button 
                onClick={() => setInvoiceOrder(null)}
                className="p-2 border border-line rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-accent">Invoice ID: #{invoiceOrder.id}</p>
                <p className="text-muted">Date: {invoiceOrder.date}</p>
                <p className="text-muted">Payment: Cash on Delivery</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{invoiceOrder.name}</p>
                <p className="text-muted">{invoiceOrder.address}, {invoiceOrder.city}</p>
                <p className="text-muted">Phone: {invoiceOrder.phone}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-line">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-line">
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold text-center">Qty</th>
                  <th className="p-3 font-semibold text-right">Price</th>
                  <th className="p-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceOrder.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-line/60">
                    <td className="p-3 font-medium">{item.name} {item.size && `(${item.size})`}</td>
                    <td className="p-3 text-center">{item.qty}</td>
                    <td className="p-3 text-right">{formatPrice(item.price)}</td>
                    <td className="p-3 text-right font-semibold">{formatPrice(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between pt-2">
              <span className="font-serif text-lg font-bold">Grand Total: {formatPrice(invoiceOrder.total)}</span>
              <Button onClick={() => window.print()} className="text-xs gap-2">
                <Printer size={14} /> Print Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

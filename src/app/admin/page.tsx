"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, addProduct, updateProduct, deleteProduct, logoutUser, updateOrderStatus, deleteOrder, setOrders, setProducts } from "@/store/store";
import { Product } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { OrderNotificationData, EmailSendResult } from "@/types/email";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, Edit, Trash2, LayoutDashboard, ShoppingBag, 
  Settings, LogOut, ArrowLeft, ImagePlus, CheckCircle, Search, Eye, Shield, Key, Lock, Server, Users, Wallet, Package, TrendingUp, FileUp, SlidersHorizontal,
  Loader2, Star, X, UploadCloud, AlertCircle
} from "lucide-react";
import { isValidImageUrl } from "@/lib/product-service";
import { upload as uploadToVercelBlob } from "@vercel/blob/client";

const CsvProductImporter = dynamic(
  () => import("@/components/admin/csv-product-importer").then((module) => module.CsvProductImporter),
  { ssr: false, loading: () => <div className="mb-7 rounded border border-line p-5 text-sm text-muted">Loading CSV import tools…</div> },
);

const HomeSliderManager = dynamic(
  () => import("@/components/admin/home-slider-manager").then((module) => module.HomeSliderManager),
  { ssr: false, loading: () => <div className="p-8 text-center text-sm text-muted">Loading Home Slider manager…</div> },
);

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { products, user, orders } = useSelector((s: RootState) => s.commerce);
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "slider" | "orders" | "users" | "security">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; phone: string | null; city: string | null; emailVerified: boolean; createdAt: string }[]>([]);

  // Admin Security & Password States
  const [adminProfile, setAdminProfile] = useState<{ name: string; email: string } | null>(null);
  const [adminCurrentPass, setAdminCurrentPass] = useState("");
  const [adminNewPass, setAdminNewPass] = useState("");
  const [adminConfirmPass, setAdminConfirmPass] = useState("");
  const [secMsg, setSecMsg] = useState({ text: "", error: false });

  // Form states for Add/Edit
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showCsvImport, setShowCsvImport] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Luxury Lawn");
  const [brand, setBrand] = useState("Sawera Collection");
  const [price, setPrice] = useState(0);
  const [compareAt, setCompareAt] = useState(0);
  const [badge, setBadge] = useState("");
  const [sku, setSku] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("Premium Lawn");
  const [stock, setStock] = useState(10);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [saleEnd, setSaleEnd] = useState(""); // ISO date string
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [colorsInput, setColorsInput] = useState("Pastel Mint, Powder Pink, Ivory");
  const [sizesSelected, setSizesSelected] = useState<string[]>([ "M", "L"]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");
  const [notification, setNotification] = useState("");
  const [productError, setProductError] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  const sizeOptions = [ "XS", "S", "M", "L", "XL"];

  const buildAdminOrderNotificationData = (orderId: string, actionType: OrderNotificationData["actionType"]): OrderNotificationData | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    return {
      customerName: order.name,
      customerEmail: order.email || "Not provided",
      customerPhone: order.phone,
      orderId: order.id,
      products: order.items
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          if (!product) return null;

          return {
            productName: product.name,
            quantity: item.qty,
            size: item.size,
            color: item.color,
            unitPrice: product.price,
            lineTotal: product.price * item.qty
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
      totalAmount: order.total,
      shippingAddress: `${order.address}, ${order.city}, ${order.zip}`,
      dateTime: new Date().toLocaleString(),
      actionType
    };
  };

  const fetchOrdersFromDb = () => {
    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.orders) {
          dispatch(setOrders(data.orders));
        }
      })
      .catch((err) => console.error("Error fetching orders:", err));
  };

  const fetchProductsFromDb = async () => {
    setProductsLoading(true);
    setProductError("");
    try {
      const res = await fetch("/api/products?includeUnpublished=true", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok || !Array.isArray(data.products)) throw new Error(data.message || "Unable to load products from the database.");
      dispatch(setProducts(data.products));
      return data.products as Product[];
    } catch (err) {
      console.error("Error fetching products:", err);
      setProductError(err instanceof Error ? err.message : "Unable to load products from the database.");
      return null;
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchUsersFromDb = () => {
    fetch("/api/users", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.users) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  };

  const handleDeleteUserClick = async (id: string, name: string) => {
    if (confirm(`Delete user "${name}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.ok) {
          showToast("User deleted successfully!");
          fetchUsersFromDb();
        } else {
          alert(data.message || "Failed to delete user.");
        }
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user.");
      }
    }
  };

  // Authenticate user & Fetch orders from MySQL DB
  useEffect(() => {
    const storedUser = localStorage.getItem("jahanara_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin") {
        router.push("/login");
      } else {
        setAuthorized(true);
        setAdminProfile({ name: parsedUser.name || "Administrator", email: parsedUser.email || "" });
        fetchOrdersFromDb();
        fetchUsersFromDb();
        void fetchProductsFromDb();
      }
    } catch (e) {
      router.push("/login");
    }
  }, [user, router, dispatch]);

  useEffect(() => {
    if (authorized && (activeTab === "orders" || activeTab === "dashboard")) {
      fetchOrdersFromDb();
    }
  }, [activeTab, authorized]);

  useEffect(() => {
    if (authorized && (activeTab === "products" || activeTab === "dashboard")) void fetchProductsFromDb();
  }, [activeTab, authorized]);

  useEffect(() => {
    if (authorized && (activeTab === "users" || activeTab === "dashboard")) {
      fetchUsersFromDb();
    }
  }, [activeTab, authorized]);

  const handleSizeToggle = (sz: string) => {
    if (sizesSelected.includes(sz)) {
      setSizesSelected(sizesSelected.filter((s) => s !== sz));
    } else {
      setSizesSelected([...sizesSelected, sz]);
    }
  };

  // Process real persistent image upload via direct Vercel Blob client upload or server storage API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadErrorMsg("");

    // Frontend validation: format and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of fileList) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setUploadStatus("error");
        setUploadErrorMsg(`"${file.name}": Image must be JPG, PNG, or WEBP.`);
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus("error");
        setUploadErrorMsg(`"${file.name}": Image size is too large (maximum 10MB per file).`);
        e.target.value = "";
        return;
      }
    }

    setUploadingImages(true);
    setUploadStatus("uploading");

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    // Attempt direct Vercel Blob client upload first, fallback to /api/admin/upload multipart
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgress(`Uploading ${i + 1} of ${fileList.length}: ${file.name}...`);

      let directSuccess = false;
      try {
        const cleanBase = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const blob = await uploadToVercelBlob(`products/${cleanBase}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload/blob",
        });
        if (blob && blob.url) {
          uploadedUrls.push(blob.url);
          directSuccess = true;
        }
      } catch (blobDirectErr: any) {
        // Direct client upload not configured or fell through, proceed to server fallback below
        console.warn("Direct blob client upload not available, using server endpoint:", blobDirectErr);
      }

      if (!directSuccess) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.ok && data.url) {
            uploadedUrls.push(data.url);
          } else {
            errors.push(`${file.name}: ${data.message || "Upload failed"}`);
          }
        } catch (serverErr: any) {
          errors.push(`${file.name}: ${serverErr.message || "Upload network error"}`);
        }
      }
    }

    if (uploadedUrls.length > 0) {
      setImageFiles((prev) => [...prev, ...uploadedUrls]);
      if (errors.length === 0) {
        setUploadStatus("success");
        setUploadProgress(
          `✓ Uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} successfully to persistent cloud storage!`
        );
      } else {
        setUploadStatus("error");
        setUploadErrorMsg(
          `Uploaded ${uploadedUrls.length} photo(s), but failed for: ${errors.join(", ")}`
        );
      }
      setTimeout(() => {
        if (errors.length === 0) {
          setUploadStatus("idle");
          setUploadProgress("");
        }
      }, 5000);
    } else {
      setUploadStatus("error");
      setUploadErrorMsg(
        `❌ Upload failed: ${errors.join(", ") || "Please verify storage configuration and try again."}`
      );
    }

    setUploadingImages(false);
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setUploadStatus("error");
      setUploadErrorMsg("URL must start with http://, https://, or /");
      return;
    }
    if (!imageFiles.includes(trimmed)) {
      setImageFiles((prev) => [...prev, trimmed]);
    }
    setImageUrl("");
    setUploadStatus("idle");
    setUploadErrorMsg("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImageFiles((prev) => {
      const target = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [target, ...rest];
    });
  };

  const handleClearImages = () => {
    setImageFiles([]);
    setImageUrl("");
    setUploadStatus("idle");
    setUploadErrorMsg("");
    setUploadProgress("");
  };

  const resetForm = () => {
    setName("");
    setCategory("Luxury Lawn");
    setBrand("Sawera Collection");
    setPrice(0);
    setCompareAt(0);
    setBadge("");
    setSku("");
    setTagsInput("");
    setDescription("");
    setFabric("Premium Lawn");
    setStock(10);
    setSalePrice(0);
    setSaleEnd("");
    setStatus("published");
    setColorsInput("Pastel Mint, Powder Pink, Ivory");
    setSizesSelected([ "M", "L"]);
    setImageFiles([]);
    setImageUrl("");
    setUploadingImages(false);
    setUploadProgress("");
    setUploadStatus("idle");
    setUploadErrorMsg("");
    setEditMode(false);
    setSelectedProductId("");
  };

  const handleEditClick = (p: Product) => {
    setEditMode(true);
    setSelectedProductId(p.id);
    setName(p.name);
    setCategory(p.category);
    setBrand(p.brand);
    setPrice(p.price);
    setCompareAt(p.compareAt || 0);
    setBadge(p.badge || "");
    setSku(p.sku || "");
    setTagsInput((p.tags || []).join(", "));
    setDescription(p.description);
    setFabric(p.fabric);
    setStock(p.stock);
    setSalePrice(p.salePrice || 0);
    setSaleEnd(p.saleEnd || "");
    setStatus(p.status || "published");
    setColorsInput(p.colors.join(", "));
    setSizesSelected(p.sizes);
    setImageFiles(p.images);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to delete product.");
        dispatch(deleteProduct(id));
        await fetchProductsFromDb();
        showToast("Product deleted successfully!");
      } catch (err) {
        console.error("Failed to delete product from DB:", err);
        setProductError(err instanceof Error ? err.message : "Failed to delete product.");
      }
    }
  };

  const handleOrderStatusChange = async (id: string, status: string) => {
    dispatch(updateOrderStatus({ id, status }));
    showToast(`Order #${id} status updated to ${status}`);

    // Sync to database (also sends customer email)
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error("Failed to sync status to DB:", err);
    }
  };

  const handleDeleteOrderClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      dispatch(deleteOrder(id));
      showToast("Order deleted successfully!");
      try {
        await fetch(`/api/orders/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete order from DB:", err);
      }
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecMsg({ text: "", error: false });

    if (adminNewPass !== adminConfirmPass) {
      setSecMsg({ text: "New passwords do not match", error: true });
      return;
    }

    // Always read fresh email from localStorage to avoid stale Redux state
    const storedUser = localStorage.getItem("jahanara_user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const adminEmail = (parsedUser?.email || user?.email || "").trim().toLowerCase();

    if (!adminEmail) {
      setSecMsg({ text: "Cannot determine admin email. Please log out and log back in.", error: true });
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          currentPassword: adminCurrentPass,
          newPassword: adminNewPass
        })
      });
      const data = await res.json();
      if (data.ok) {
        setSecMsg({ text: "Admin password updated successfully!", error: false });
        setAdminCurrentPass("");
        setAdminNewPass("");
        setAdminConfirmPass("");
      } else {
        setSecMsg({ text: data.message || "Failed to update password", error: true });
      }
    } catch (err: any) {
      setSecMsg({ text: err.message || "Error changing password", error: true });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProduct) return;
    if (uploadingImages) {
      alert("Please wait until image uploads have completed before publishing.");
      return;
    }
    
    if (!name || !description || Number(price) <= 0) {
      alert("Name, Description, and a valid Price are required.");
      return;
    }

    // Combine uploaded files and input URL
    const combined = [...imageFiles];
    if (imageUrl.trim() && !combined.includes(imageUrl.trim()) && isValidImageUrl(imageUrl.trim())) {
      combined.push(imageUrl.trim());
    }
    const finalImages = combined.filter(isValidImageUrl);
    if (finalImages.length === 0) {
      finalImages.push("/images/hero_lawn.png"); // fallback default image
    }

    const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const colors = colorsInput.split(",").map((c) => c.trim()).filter(Boolean);

    const productData: Product = {
      id: editMode ? selectedProductId : `p-${Date.now()}`,
      slug: productSlug,
      name,
      category,
      brand,
      price: Number(price),
      compareAt: Number(compareAt) > 0 ? Number(compareAt) : undefined,
      rating: editMode ? products.find(p => p.id === selectedProductId)?.rating || 4.8 : 5.0,
      reviews: editMode ? products.find(p => p.id === selectedProductId)?.reviews || 1 : 1,
      badge: badge || undefined,
      sku: sku || undefined,
      tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      colors,
      sizes: sizesSelected.length > 0 ? sizesSelected : ["M", "L"],
      images: finalImages,
      description,
      fabric,
      stock: Number(stock),
      salePrice: Number(salePrice) > 0 ? Number(salePrice) : undefined,
      saleEnd: saleEnd || undefined,
      status,
      isActive: true,
    };

    setSavingProduct(true);
    setProductError("");
    try {
      const res = await fetch(editMode ? `/api/products/${selectedProductId}` : "/api/products", {
        method: editMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.product) throw new Error(data.message || "Failed to save product.");

      // Only the product confirmed by MySQL is allowed into application state.
      if (editMode) dispatch(updateProduct(data.product));
      else dispatch(addProduct(data.product));
      await fetchProductsFromDb();
      showToast(editMode ? "Product updated successfully!" : "Product added successfully!");
      setShowForm(false);
      setShowCsvImport(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save product to DB:", err);
      setProductError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleLogout = () => {
    void fetch("/api/auth/logout", { method: "POST" });
    dispatch(logoutUser());
    localStorage.removeItem("jahanara_user");
    router.push("/login");
  };

  const loadImportedProductIntoForm = (product: Partial<Product>) => {
    setEditMode(false);
    setSelectedProductId("");
    setName(product.name || "");
    setCategory(product.category || "Luxury Lawn");
    setBrand(product.brand || "Sawera Collection");
    setPrice(product.price || 0);
    setCompareAt(product.compareAt || 0);
    setBadge(product.badge || "");
    setSku(product.sku || "");
    setTagsInput((product.tags || []).join(", "));
    setDescription(product.description || "");
    setFabric(product.fabric || "Pure Lawn");
    setStock(product.stock || 0);
    setColorsInput((product.colors || []).join(", "));
    setSizesSelected(product.sizes?.length ? product.sizes : ["M", "L"]);
    setImageFiles(product.images || []);
    setStatus(product.status || "draft");
    setShowCsvImport(false);
    showToast("CSV row loaded into the Add Suit form. Review it, then save.");
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authorized) {
    return (
      <div className="container-lux py-32 text-center">
        <p className="text-xl font-serif text-muted">Checking administrator credentials...</p>
      </div>
    );
  }

  return (
    <section className="container-lux py-10">
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-foreground text-background px-6 py-4 rounded shadow-2xl border border-accent animate-pulse text-xs tracking-wider uppercase font-semibold">
          <CheckCircle size={16} className="text-accent" /> {notification}
        </div>
      )}
      {productError && (
        <div role="alert" className="fixed top-5 right-5 z-50 max-w-md rounded border border-red-300 bg-red-50 px-6 py-4 text-sm text-red-800 shadow-2xl">
          <strong>Product action failed.</strong> {productError}
        </div>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between border-b border-line pb-8 mb-8">
        <div>
          <span className="tracked-luxury text-xs text-accent">Studio Admin</span>
          <h1 className="font-serif text-6xl">Sawera Atelier</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye size={16} /> View Shop
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50">
            <LogOut size={16} /> Log Out
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Admin Navigation */}
        <aside className="space-y-2">
          <button
            onClick={() => { setActiveTab("dashboard"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "dashboard" && !showForm ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><LayoutDashboard size={16} /> Dashboard</span>
          </button>
          <button
            onClick={() => { setActiveTab("products"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "products" && !showForm ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><ShoppingBag size={16} /> Manage Products</span>
          </button>
          <button
            onClick={() => { setActiveTab("slider"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "slider" && !showForm ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><SlidersHorizontal size={16} /> Home Hero Slider</span>
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "orders" ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><LayoutDashboard size={16} /> Customer Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("users"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "users" ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><Users size={16} /> Registered Users ({users.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("security"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "security" ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><Shield size={16} /> Privacy & Security</span>
          </button>
          <button
            onClick={() => { setShowForm(true); setEditMode(false); resetForm(); setShowCsvImport(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold border border-dashed border-accent text-accent hover:bg-accent/5 transition mt-4`}
          >
            <span className="flex items-center gap-3"><Plus size={16} /> Add New Suit</span>
          </button>
        </aside>

        {/* Admin Contents */}
        <main className="glass p-6 md:p-8 rounded min-h-[500px]">
          {showForm ? (
            /* CRUD Add/Edit Form */
            <div>
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setShowForm(false)} className="hover:text-accent transition">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-serif text-4xl">{editMode ? "Edit Creation" : "Publish New Creation"}</h2>
                {!editMode && <Button type="button" variant="outline" className="ml-auto" onClick={() => setShowCsvImport((visible) => !visible)}><FileUp size={15} /> {showCsvImport ? "Manual Entry" : "Import File"}</Button>}
              </div>

              {showCsvImport && <CsvProductImporter onLoadProduct={loadImportedProductIntoForm} onImported={async () => { await fetchProductsFromDb(); showToast("Database-confirmed import is now synced with admin products."); }} />}

              <form onSubmit={handleSaveProduct} className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Suit Name *
                    <Input className="mt-2" placeholder="e.g. Sawera Organza Peshwas" value={name} onChange={(e) => setName(e.target.value)} required />
                  </label>
                  <label className="block text-sm font-medium">
                    Category *
                    <select
                      className="mt-2 h-11 w-full border border-line bg-background px-3 rounded text-sm focus-ring"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Luxury Lawn</option>
                      <option>Printed Lawn</option>
                      <option>Festive Chiffon</option>
                      <option>Everyday Essentials</option>
                      <option>Bridal & Couture</option>
                      <option>Winter Festive</option>
                      <option>Sale</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    Publishing Status *
                    <select className="mt-2 h-11 w-full border border-line bg-background px-3 rounded text-sm focus-ring" value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}>
                      <option value="published">Published — visible on website</option>
                      <option value="draft">Draft — admin only</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <label className="block text-sm font-medium">
                    Brand Name *
                    <Input className="mt-2" placeholder="e.g. Sawera Collection" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                  </label>
                  <label className="block text-sm font-medium">
                    Price (PKR) *
                    <Input className="mt-2" type="number" min="0" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} required />
                  </label>
                  <label className="block text-sm font-medium">
                    Compare At Price (PKR)
                    <Input className="mt-2" type="number" min="0" value={compareAt || ""} onChange={(e) => setCompareAt(Number(e.target.value))} />
                  </label>
                  <label className="block text-sm font-medium">
                    SKU
                    <Input className="mt-2" placeholder="e.g. ZL-001" value={sku} onChange={(e) => setSku(e.target.value)} />
                  </label>
                </div>

                <label className="block text-sm font-medium">
                  Product Tags (separated by commas)
                  <Input className="mt-2" placeholder="New, Lawn, Festive" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
                </label>

                {/* Promotion & Sale Settings */}
                <div className="grid gap-6 sm:grid-cols-2 border border-line/50 rounded p-4 bg-background/30">
                  <label className="block text-sm font-medium">
                    Sale Price (PKR) - Optional
                    <Input className="mt-2" type="number" min="0" value={salePrice || ""} onChange={(e) => setSalePrice(Number(e.target.value))} />
                  </label>
                  <label className="block text-sm font-medium">
                    Sale End Date (Local Date/Time) - Optional
                    <Input className="mt-2" type="datetime-local" value={saleEnd} onChange={(e) => setSaleEnd(e.target.value)} />
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <label className="block text-sm font-medium">
                    Fabric Type
                    <Input className="mt-2" placeholder="e.g. Pure Lawn + Silk Dupatta" value={fabric} onChange={(e) => setFabric(e.target.value)} />
                  </label>
                  <label className="block text-sm font-medium">
                    Stock Availability *
                    <Input className="mt-2" type="number" min="0" value={stock || ""} onChange={(e) => setStock(Number(e.target.value))} required />
                  </label>
                  <label className="block text-sm font-medium">
                    Product Ribbon Badge
                    <Input className="mt-2" placeholder="e.g. New, Bestseller, 15% OFF" value={badge} onChange={(e) => setBadge(e.target.value)} />
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Available Colors (separated by commas)
                    <Input className="mt-2" placeholder="Ivory, Powder Pink, Mint" value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} />
                  </label>
                  <div>
                    <span className="block text-sm font-medium mb-3">Sizes Available</span>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {sizeOptions.map((sz) => (
                        <label key={sz} className="flex items-center gap-2 cursor-pointer border border-line px-3 py-2 rounded text-xs select-none">
                          <input
                            type="checkbox"
                            checked={sizesSelected.includes(sz)}
                            onChange={() => handleSizeToggle(sz)}
                            className="accent-[var(--accent)]"
                          />
                          {sz}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium">
                  Suit Description *
                  <textarea
                    rows={4}
                    className="mt-2 w-full border border-line bg-background p-4 rounded text-sm focus-ring outline-none resize-none"
                    placeholder="Provide a luxurious copy describing embroidery, panel flow, and dupatta designs..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </label>

                {/* Upload Image Section */}
                <div className="border border-line rounded p-5 bg-background/50 grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="tracked-luxury text-xs text-accent font-semibold flex items-center gap-2">
                      <ImagePlus size={14} /> Product Images & Gallery
                    </h3>
                    {uploadingImages && (
                      <span className="flex items-center gap-1.5 text-xs text-accent font-medium">
                        <Loader2 className="animate-spin" size={13} /> {uploadProgress}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="font-medium">Upload Photos from Device</span>
                      <span className="block text-[11px] text-muted mb-2">Select 1 or more images (JPG, PNG, WEBP — max 10MB each)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        multiple
                        disabled={uploadingImages}
                        onChange={handleImageUpload}
                        className="block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-foreground file:text-background hover:file:opacity-85 file:cursor-pointer disabled:opacity-50"
                      />
                    </label>

                    <div>
                      <span className="block text-sm font-medium">Or Paste Image Web URL</span>
                      <span className="block text-[11px] text-muted mb-2">Paste a direct public image link (e.g. https://...)</span>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com/suit.jpg"
                          value={imageUrl}
                          disabled={uploadingImages}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={handleAddImageUrl} disabled={!imageUrl.trim() || uploadingImages}>
                          <Plus size={14} /> Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {uploadStatus === "uploading" && (
                    <div className="flex items-center gap-2 rounded bg-accent/10 border border-accent/20 p-3 text-xs text-accent font-medium">
                      <Loader2 className="animate-spin shrink-0" size={15} />
                      <span>{uploadProgress || "Uploading images to persistent storage..."}</span>
                    </div>
                  )}
                  {uploadStatus === "success" && (
                    <div className="flex items-center gap-2 rounded bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="shrink-0" size={15} />
                      <span>{uploadProgress || "✓ Upload completed successfully!"}</span>
                    </div>
                  )}
                  {uploadStatus === "error" && (
                    <div className="flex items-center gap-2 rounded bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 font-medium">
                      <AlertCircle className="shrink-0" size={15} />
                      <span>{uploadErrorMsg || "Upload failed. Please try again."}</span>
                    </div>
                  )}

                  {/* Photos Preview Grid */}
                  {imageFiles.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-line/60">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-muted">
                          Photos Gallery ({imageFiles.length}) — First image is the primary cover
                        </span>
                        <button type="button" onClick={handleClearImages} className="text-xs text-red-600 hover:underline">
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {imageFiles.map((src, index) => (
                          <div key={`${src}-${index}`} className="group relative w-24 aspect-[3/4] border border-line overflow-hidden rounded bg-neutral-100 shadow-sm">
                            <Image
                              src={src}
                              alt={`Product image ${index + 1}`}
                              fill
                              unoptimized={src.startsWith("http")}
                              className="object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/images/hero_lawn.png";
                              }}
                            />
                            {index === 0 ? (
                              <span className="absolute top-1 left-1 bg-accent text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow">
                                Main Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(index)}
                                className="opacity-0 group-hover:opacity-100 absolute top-1 left-1 bg-background/90 hover:bg-foreground hover:text-background text-[9px] font-semibold px-1.5 py-0.5 rounded shadow transition flex items-center gap-0.5"
                                title="Set as primary image"
                              >
                                <Star size={9} /> Set Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                              title="Remove image"
                              aria-label="Remove image"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit" disabled={savingProduct || uploadingImages}>
                    {savingProduct ? "Saving product..." : uploadingImages ? "Uploading images..." : editMode ? "Apply Changes" : "Publish Suit"}
                  </Button>
                </div>
              </form>
            </div>
          ) : activeTab === "dashboard" ? (
            /* Dashboard Overview */
            <div>
              <h2 className="font-serif text-4xl mb-2">Dashboard Overview</h2>
              <p className="text-sm text-muted mb-8">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
                <div className="border border-line rounded p-6 bg-background/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-accent/10 text-accent flex items-center justify-center">
                      <Wallet size={18} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Total Sales</span>
                  </div>
                  <p className="font-serif text-3xl">{formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}</p>
                  <p className="text-xs text-muted mt-2">Across all COD orders</p>
                </div>

                <div className="border border-line rounded p-6 bg-background/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-accent/10 text-accent flex items-center justify-center">
                      <LayoutDashboard size={18} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Total Orders</span>
                  </div>
                  <p className="font-serif text-3xl">{orders.length}</p>
                  <p className="text-xs text-muted mt-2">
                    {orders.filter((o) => o.status === "Processing").length} pending, {orders.filter((o) => o.status === "Shipped").length} shipped
                  </p>
                </div>

                <div className="border border-line rounded p-6 bg-background/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-accent/10 text-accent flex items-center justify-center">
                      <Package size={18} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Active Products</span>
                  </div>
                  <p className="font-serif text-3xl">{products.length}</p>
                  <p className="text-xs text-muted mt-2">{products.filter((p) => p.stock > 0).length} currently in stock</p>
                </div>

                <div className="border border-line rounded p-6 bg-background/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-accent/10 text-accent flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Total Customers</span>
                  </div>
                  <p className="font-serif text-3xl">{users.length}</p>
                  <p className="text-xs text-muted mt-2">
                    {users.filter((u) => u.createdAt && Date.now() - new Date(u.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length} new this week
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="tracked-luxury text-xs text-accent font-semibold flex items-center gap-2">
                  <TrendingUp size={14} /> Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-accent underline"
                >
                  View all orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                      <th className="py-4 font-medium">Order ID</th>
                      <th className="py-4 font-medium">Customer</th>
                      <th className="py-4 font-medium">Date</th>
                      <th className="py-4 font-medium">Total</th>
                      <th className="py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-b border-line/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition">
                        <td className="py-4 font-semibold text-accent">#{o.id}</td>
                        <td className="py-4">
                          <div className="text-sm font-medium">{o.name}</div>
                          <div className="text-xs text-muted max-w-[180px] truncate">{o.email || "Email not provided"}</div>
                        </td>
                        <td className="py-4 text-sm text-muted">{o.date}</td>
                        <td className="py-4 text-sm font-semibold">{formatPrice(o.total)}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                            o.status === "Delivered"
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                              : o.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : o.status === "Shipped"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p className="text-center text-muted py-12">No orders have been placed yet.</p>
                )}
              </div>
            </div>
          ) : activeTab === "products" ? (
            /* Products List View */
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="font-serif text-4xl">All Published Suits ({filteredProducts.length})</h2>
                <div className="relative max-w-xs flex-1">
                  <Search className="absolute left-3 top-3.5 text-muted" size={16} />
                  <Input placeholder="Search catalog..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              {productsLoading && <p className="mb-4 text-sm text-muted">Loading products from database...</p>}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                      <th className="py-4 font-medium">Image</th>
                      <th className="py-4 font-medium">Name</th>
                      <th className="py-4 font-medium">Category</th>
                      <th className="py-4 font-medium">Price</th>
                      <th className="py-4 font-medium">Stock</th>
                      <th className="py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-line/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition">
                        <td className="py-4">
                          <div className="relative w-12 aspect-[3/4] border border-line/50 overflow-hidden bg-neutral-100 rounded">
                            {p.images && p.images[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                unoptimized={p.images[0].startsWith("http")}
                                className="object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/hero_lawn.png";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-muted">No Image</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 font-medium max-w-[200px] truncate">{p.name}</td>
                        <td className="py-4 text-xs text-muted">{p.category}</td>
                        <td className="py-4 text-sm font-semibold">{formatPrice(p.price)}</td>
                        <td className="py-4 text-sm">{p.stock} pcs</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-2 border border-line rounded hover:bg-foreground hover:text-background transition"
                              title="Edit product"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p.id)}
                              className="p-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <p className="text-center text-muted py-12">No creations matched your search criteria.</p>
                )}
              </div>
            </div>
          ) : activeTab === "slider" ? (
            /* Home Hero Slider Management View */
            <HomeSliderManager products={products} onToast={showToast} />
          ) : activeTab === "orders" ? (
            /* Orders Management View */
            <div>
              <h2 className="font-serif text-4xl mb-6">Customer COD Orders ({orders.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                      <th className="py-4 font-medium">Order ID</th>
                      <th className="py-4 font-medium">Customer</th>
                      <th className="py-4 font-medium">Date</th>
                      <th className="py-4 font-medium">Method</th>
                      <th className="py-4 font-medium">Total</th>
                      <th className="py-4 font-medium">Status</th>
                      <th className="py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-line/60">
                        <td className="py-4 font-semibold text-accent">#{o.id}</td>
                        <td className="py-4">
                          <div className="text-sm font-medium">{o.name}</div>
                          <div className="text-xs text-muted max-w-[180px] truncate">{o.email || "Email not provided"}</div>
                          <div className="text-xs text-muted max-w-[180px] truncate">{o.address}, {o.city}</div>
                          <div className="text-xs text-muted">{o.phone}</div>
                        </td>
                        <td className="py-4 text-sm text-muted">{o.date}</td>
                        <td className="py-4 text-xs">Cash on Delivery</td>
                        <td className="py-4 text-sm font-semibold">{formatPrice(o.total)}</td>
                        <td className="py-4">
                          <select 
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 text-yellow-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded outline-none cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteOrderClick(o.id)}
                            className="p-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition inline-block"
                            title="Delete order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p className="text-center text-muted py-12">No orders have been placed yet.</p>
                )}
              </div>
            </div>
          ) : activeTab === "users" ? (
            /* Registered Users View */
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="font-serif text-4xl">Registered Users ({users.length})</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                      <th className="py-4 font-medium">Name</th>
                      <th className="py-4 font-medium">Email</th>
                      <th className="py-4 font-medium">Role</th>
                      <th className="py-4 font-medium">Verification</th>
                      <th className="py-4 font-medium">Phone</th>
                      <th className="py-4 font-medium">City</th>
                      <th className="py-4 font-medium">Joined</th>
                      <th className="py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-line/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition">
                        <td className="py-4 font-medium">{u.name}</td>
                        <td className="py-4 text-sm text-muted">{u.email}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                            u.role === "admin"
                              ? "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border border-purple-200"
                              : "bg-neutral-100 dark:bg-neutral-900 text-muted border border-line"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4">
                          {u.emailVerified ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                              Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-sm text-muted">{u.phone || "—"}</td>
                        <td className="py-4 text-sm text-muted">{u.city || "—"}</td>
                        <td className="py-4 text-sm text-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-4 text-right">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleDeleteUserClick(u.id, u.name)}
                              className="p-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition inline-block"
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-center text-muted py-12">No users have registered yet.</p>
                )}
              </div>
            </div>
          ) : (
            /* Privacy & Security View */
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-4xl mb-2">Privacy & Admin Security</h2>
                <p className="text-sm text-muted">Manage your administrator account security, password, and database encryption status.</p>
              </div>

              {secMsg.text && (
                <div className={`p-4 rounded text-sm ${secMsg.error ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                  {secMsg.text}
                </div>
              )}

              {/* Admin Profile Info Card */}
              <div className="border border-line rounded p-6 bg-background/50 space-y-4">
                <h3 className="tracked-luxury text-xs text-accent font-semibold flex items-center gap-2">
                  <Shield size={16} /> Admin Account Info
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-xs text-muted block">Administrator Name</span>
                    <span className="font-semibold text-foreground">{adminProfile?.name || user?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block">Admin Email (used for login)</span>
                    <span className="font-semibold text-foreground">{adminProfile?.email || user?.email || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="border border-line rounded p-6 bg-background/50 space-y-4">
                <h3 className="tracked-luxury text-xs text-accent font-semibold flex items-center gap-2">
                  <Key size={16} /> Update Admin Password
                </h3>
                <form onSubmit={handleAdminPasswordChange} className="grid gap-4 max-w-md">
                  <label className="block text-sm">
                    Current Password *
                    <Input 
                      type="password"
                      className="mt-2"
                      value={adminCurrentPass}
                      onChange={(e) => setAdminCurrentPass(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block text-sm">
                    New Password *
                    <Input 
                      type="password"
                      className="mt-2"
                      value={adminNewPass}
                      onChange={(e) => setAdminNewPass(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block text-sm">
                    Confirm New Password *
                    <Input 
                      type="password"
                      className="mt-2"
                      value={adminConfirmPass}
                      onChange={(e) => setAdminConfirmPass(e.target.value)}
                      required
                    />
                  </label>
                  <Button type="submit" className="mt-2">Update Admin Password</Button>
                </form>
              </div>

              {/* System Security Status */}
              <div className="border border-line rounded p-6 bg-background/50 space-y-4">
                <h3 className="tracked-luxury text-xs text-accent font-semibold flex items-center gap-2">
                  <Server size={16} /> Security & System Integrity
                </h3>
                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="p-4 border border-line rounded bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block mb-1">✔ Hostinger MySQL DB</span>
                    <span>Encrypted Connection SSL/TLS Active</span>
                  </div>
                  <div className="p-4 border border-line rounded bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block mb-1">✔ Hostinger SMTP</span>
                    <span>Secure Email Notifications Configured</span>
                  </div>
                  <div className="p-4 border border-line rounded bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block mb-1">✔ Password Hashing</span>
                    <span>Bcrypt Salt Round 12 Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, addProduct, updateProduct, deleteProduct, logoutUser } from "@/store/store";
import { Product } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, Edit, Trash2, LayoutDashboard, ShoppingBag, 
  Settings, LogOut, ArrowLeft, ImagePlus, CheckCircle, Search, Eye
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { products, user, orders } = useSelector((s: RootState) => s.commerce);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [authorized, setAuthorized] = useState(false);

  // Form states for Add/Edit
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Luxury Lawn");
  const [brand, setBrand] = useState("Jahanara Heritage");
  const [price, setPrice] = useState(0);
  const [compareAt, setCompareAt] = useState(0);
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("Premium Lawn");
  const [stock, setStock] = useState(10);
  const [colorsInput, setColorsInput] = useState("Pastel Mint, Powder Pink, Ivory");
  const [sizesSelected, setSizesSelected] = useState<string[]>(["Unstitched", "M", "L"]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [notification, setNotification] = useState("");

  const sizeOptions = ["Unstitched", "XS", "S", "M", "L", "XL"];

  // Authenticate user
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
      }
    } catch (e) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSizeToggle = (sz: string) => {
    if (sizesSelected.includes(sz)) {
      setSizesSelected(sizesSelected.filter((s) => s !== sz));
    } else {
      setSizesSelected([...sizesSelected, sz]);
    }
  };

  // Process image upload to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    const promises = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64Strings) => {
      setImageFiles([...imageFiles, ...base64Strings]);
    });
  };

  const handleClearImages = () => {
    setImageFiles([]);
    setImageUrl("");
  };

  const resetForm = () => {
    setName("");
    setCategory("Luxury Lawn");
    setBrand("Jahanara Heritage");
    setPrice(0);
    setCompareAt(0);
    setBadge("");
    setDescription("");
    setFabric("Premium Lawn");
    setStock(10);
    setColorsInput("Pastel Mint, Powder Pink, Ivory");
    setSizesSelected(["Unstitched", "M", "L"]);
    setImageFiles([]);
    setImageUrl("");
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
    setDescription(p.description);
    setFabric(p.fabric);
    setStock(p.stock);
    setColorsInput(p.colors.join(", "));
    setSizesSelected(p.sizes);
    setImageFiles(p.images);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
      showToast("Product deleted successfully!");
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || price <= 0) {
      alert("Name, Description, and a valid Price are required.");
      return;
    }

    // Combine uploaded files and input URL
    const finalImages = [...imageFiles];
    if (imageUrl) finalImages.push(imageUrl);
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
      compareAt: compareAt > 0 ? Number(compareAt) : undefined,
      rating: editMode ? products.find(p => p.id === selectedProductId)?.rating || 4.8 : 5.0,
      reviews: editMode ? products.find(p => p.id === selectedProductId)?.reviews || 1 : 1,
      badge: badge || undefined,
      colors,
      sizes: sizesSelected.length > 0 ? sizesSelected : ["Unstitched"],
      images: finalImages,
      description,
      fabric,
      stock: Number(stock)
    };

    if (editMode) {
      dispatch(updateProduct(productData));
      showToast("Product updated successfully!");
    } else {
      dispatch(addProduct(productData));
      showToast("Product added successfully!");
    }

    setShowForm(false);
    resetForm();
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("jahanara_user");
    router.push("/login");
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

      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between border-b border-line pb-8 mb-8">
        <div>
          <span className="tracked-luxury text-xs text-accent">Studio Admin</span>
          <h1 className="font-serif text-6xl">Jahanara Atelier</h1>
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
            onClick={() => { setActiveTab("products"); setShowForm(false); }}
            className={`w-full text-left px-5 py-4 rounded text-sm uppercase tracking-wider font-semibold transition ${
              activeTab === "products" && !showForm ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted"
            }`}
          >
            <span className="flex items-center gap-3"><ShoppingBag size={16} /> Manage Products</span>
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
            onClick={() => { setShowForm(true); setEditMode(false); resetForm(); }}
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
              </div>

              <form onSubmit={handleSaveProduct} className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Suit Name *
                    <Input className="mt-2" placeholder="e.g. Jahanara Organza Peshwas" value={name} onChange={(e) => setName(e.target.value)} required />
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
                      <option>Ready To Wear</option>
                      <option>Bridal & Couture</option>
                      <option>Winter Festive</option>
                      <option>Sale</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <label className="block text-sm font-medium">
                    Brand Name *
                    <Input className="mt-2" placeholder="e.g. Jahanara Heritage" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                  </label>
                  <label className="block text-sm font-medium">
                    Price (PKR) *
                    <Input className="mt-2" type="number" min="0" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} required />
                  </label>
                  <label className="block text-sm font-medium">
                    Compare At Price (PKR)
                    <Input className="mt-2" type="number" min="0" value={compareAt || ""} onChange={(e) => setCompareAt(Number(e.target.value))} />
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
                  <h3 className="tracked-luxury text-xs text-accent font-semibold flex items-center gap-2">
                    <ImagePlus size={14} /> Product Images
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      Upload Photos from Device
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="mt-2 block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-foreground file:text-background hover:file:opacity-85 file:cursor-pointer"
                      />
                    </label>
                    <label className="block text-sm">
                      Or Paste Image Web URL
                      <Input
                        className="mt-2"
                        placeholder="https://example.com/suit.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </label>
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-muted">Photos Preview ({imageFiles.length})</span>
                        <button type="button" onClick={handleClearImages} className="text-xs text-red-600 underline">Clear All</button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {imageFiles.map((base64, index) => (
                          <div key={index} className="relative w-20 aspect-[3/4] border border-line overflow-hidden rounded">
                            <Image src={base64} alt={`Preview ${index}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">
                    {editMode ? "Apply Changes" : "Publish Suit"}
                  </Button>
                </div>
              </form>
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
                          <div className="relative w-12 aspect-[3/4] border border-line/50 overflow-hidden bg-neutral-100">
                            {p.images && p.images[0] && (
                              <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
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
          ) : (
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
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-line/60">
                        <td className="py-4 font-semibold text-accent">#{o.id}</td>
                        <td className="py-4">
                          <div className="text-sm font-medium">{o.name}</div>
                          <div className="text-xs text-muted max-w-[180px] truncate">{o.address}, {o.city}</div>
                          <div className="text-xs text-muted">{o.phone}</div>
                        </td>
                        <td className="py-4 text-sm text-muted">{o.date}</td>
                        <td className="py-4 text-xs">Cash on Delivery</td>
                        <td className="py-4 text-sm font-semibold">{formatPrice(o.total)}</td>
                        <td className="py-4">
                          <span className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 text-yellow-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
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
          )}
        </main>
      </div>
    </section>
  );
}

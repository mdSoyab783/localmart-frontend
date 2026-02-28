"use client";
import { useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  description: string;
  emoji: string;
  stock: number;
  active: boolean;
  image?: string;
};

type ShopOwner = {
  email: string;
  shopName: string;
  ownerName: string;
  shopId: string;
  phone?: string;
  address?: string;
  category?: string;
};

const categories = ["Groceries", "Clothing", "Female Items", "Daily Needs", "Electronics", "Food & Snacks"];
const emojis = ["🥦", "🌾", "🍎", "🥛", "👘", "👕", "👗", "🧥", "✨", "💄", "💇", "🌸", "🪥", "🧺", "🧴", "📱", "🍱", "🧁"];
const defaultForm = { name: "", price: "", originalPrice: "", category: "Groceries", description: "", emoji: "🛍️", stock: "", image: "" };

export default function DashboardPage() {
  const [shopOwner, setShopOwner] = useState<ShopOwner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "add" | "profile">("products");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({ ownerName: "", shopName: "", email: "", phone: "", address: "", category: "Groceries" });
  const [profileEditing, setProfileEditing] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("shopOwnerLoggedIn");
    if (!stored) { window.location.href = "/shop-auth"; return; }
    const owner = JSON.parse(stored);
    setShopOwner(owner);
    setProfileForm({
      ownerName: owner.ownerName || "",
      shopName: owner.shopName || "",
      email: owner.email || "",
      phone: owner.phone || "",
      address: owner.address || "",
      category: owner.category || "Groceries",
    });
    const shopId = owner.shopId || "default";
    const storedProducts = localStorage.getItem("shopProducts_" + shopId);
    if (storedProducts) setProducts(JSON.parse(storedProducts));
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    const shopId = shopOwner?.shopId || "default";
    localStorage.setItem("shopProducts_" + shopId, JSON.stringify(updated));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = () => {
    if (!profileForm.ownerName || !profileForm.shopName || !profileForm.email || !profileForm.phone) {
      showToast("Please fill in all required fields!", "error"); return;
    }
    const updated = { ...shopOwner, ...profileForm };
    localStorage.setItem("shopOwnerLoggedIn", JSON.stringify(updated));
    const fullData = localStorage.getItem("shopOwner");
    if (fullData) {
      const full = JSON.parse(fullData);
      localStorage.setItem("shopOwner", JSON.stringify({ ...full, ...profileForm }));
    }
    setShopOwner(updated);
    setProfileEditing(false);
    showToast("✅ Profile updated successfully!", "success");
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.originalPrice || !form.stock) {
      showToast("Please fill in all required fields!", "error"); return;
    }
    if (Number(form.price) >= Number(form.originalPrice)) {
      showToast("Sale price must be less than original price!", "error"); return;
    }
    if (editId !== null) {
      const updated = products.map((p) => p.id === editId ? { ...p, ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), stock: Number(form.stock) } : p);
      saveProducts(updated);
      showToast("✅ Product updated successfully!", "success");
      setEditId(null);
    } else {
      const newProduct: Product = { id: Date.now(), name: form.name, price: Number(form.price), originalPrice: Number(form.originalPrice), category: form.category, description: form.description, emoji: form.emoji, image: form.image || "", stock: Number(form.stock), active: true };
      saveProducts([...products, newProduct]);
      showToast("🎉 Product added successfully!", "success");
    }
    setForm(defaultForm);
    setActiveTab("products");
  };

  const handleEdit = (product: Product) => {
    setForm({ name: product.name, price: String(product.price), originalPrice: String(product.originalPrice), category: product.category, description: product.description, emoji: product.emoji, stock: String(product.stock) });
    setEditId(product.id);
    setActiveTab("add");
  };

  const handleDelete = (id: number) => {
    saveProducts(products.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    showToast("🗑️ Product deleted!", "success");
  };

  const toggleActive = (id: number) => {
    saveProducts(products.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleLogout = () => {
    localStorage.removeItem("shopOwnerLoggedIn");
    window.location.href = "/shop-auth";
  };

  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  if (!shopOwner) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 24, fontWeight: 800 }}>Loading...</div>
    </div>
  );

  const inputStyle = { width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" as const, background: "#fff" };
  const disabledInputStyle = { ...inputStyle, background: "#f9f9f9", color: "#888" };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#1a1a2e" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", padding: "14px 28px", borderRadius: 14, fontWeight: 800, fontSize: 15, zIndex: 9999, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", background: toast.type === "success" ? "#1a1a2e" : "#FF6B6B", color: "#fff", whiteSpace: "nowrap" }}>
          {toast.message}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px", maxWidth: 380, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Delete Product?</h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 12, border: "2px solid #f0f0f0", borderRadius: 12, fontWeight: 700, cursor: "pointer", background: "#fff", fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", background: "#FF6B6B", color: "#fff", fontSize: 14 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e" }}>{shopOwner.shopName}</div>
            <div style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700 }}>Shop Owner Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>👤 {shopOwner.ownerName}</span>
          <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#555", textDecoration: "none" }}>View Store</a>
          <button onClick={handleLogout} style={{ background: "#fff5f5", color: "#FF6B6B", border: "none", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Products", value: products.length, icon: "📦", color: "#e8f4ff" },
            { label: "Active Products", value: products.filter(p => p.active).length, icon: "✅", color: "#d3f9d8" },
            { label: "Out of Stock", value: products.filter(p => p.stock === 0).length, icon: "⚠️", color: "#fff3bf" },
            { label: "Inventory Value", value: `₹${totalRevenue.toLocaleString()}`, icon: "💰", color: "#ffd6e7" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0" }}>
              <div style={{ background: stat.color, width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <button onClick={() => { setActiveTab("products"); setEditId(null); setForm(defaultForm); }} style={{ padding: "10px 24px", borderRadius: 12, border: "2px solid", borderColor: activeTab === "products" ? "#FF6B6B" : "#f0f0f0", background: activeTab === "products" ? "#FF6B6B" : "#fff", color: activeTab === "products" ? "#fff" : "#555", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            📦 My Products ({products.length})
          </button>
          <button onClick={() => { setActiveTab("add"); setEditId(null); setForm(defaultForm); }} style={{ padding: "10px 24px", borderRadius: 12, border: "2px solid", borderColor: activeTab === "add" ? "#FF6B6B" : "#f0f0f0", background: activeTab === "add" ? "#FF6B6B" : "#fff", color: activeTab === "add" ? "#fff" : "#555", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            ➕ Add Product
          </button>
          <button onClick={() => { setActiveTab("profile"); setProfileEditing(false); }} style={{ padding: "10px 24px", borderRadius: 12, border: "2px solid", borderColor: activeTab === "profile" ? "#FF6B6B" : "#f0f0f0", background: activeTab === "profile" ? "#FF6B6B" : "#fff", color: activeTab === "profile" ? "#fff" : "#555", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            👤 My Profile
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #f0f0f0" }}>

            {/* PROFILE HEADER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  🏪
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{shopOwner.shopName}</h2>
                  <p style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>👤 {shopOwner.ownerName}</p>
                  <p style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 700 }}>🏷️ {shopOwner.category || "Groceries"}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileEditing(!profileEditing)}
                style={{ padding: "10px 20px", borderRadius: 12, border: "2px solid", borderColor: profileEditing ? "#f0f0f0" : "#FF6B6B", background: profileEditing ? "#fff" : "#FF6B6B", color: profileEditing ? "#555" : "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
              >
                {profileEditing ? "Cancel" : "✏️ Edit Profile"}
              </button>
            </div>

            {/* PROFILE FIELDS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Owner Name *</label>
                <input
                  name="ownerName"
                  value={profileForm.ownerName}
                  onChange={handleProfileChange}
                  disabled={!profileEditing}
                  style={profileEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Shop Name *</label>
                <input
                  name="shopName"
                  value={profileForm.shopName}
                  onChange={handleProfileChange}
                  disabled={!profileEditing}
                  style={profileEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={!profileEditing}
                  style={profileEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  disabled={!profileEditing}
                  style={profileEditing ? inputStyle : disabledInputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Shop Category</label>
                <select
                  name="category"
                  value={profileForm.category}
                  onChange={handleProfileChange}
                  disabled={!profileEditing}
                  style={profileEditing ? inputStyle : disabledInputStyle}
                >
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Shop Address</label>
                <input
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  disabled={!profileEditing}
                  placeholder="e.g. Shop No. 5, Main Market"
                  style={profileEditing ? inputStyle : disabledInputStyle}
                />
              </div>

            </div>

            {/* SAVE BUTTON */}
            {profileEditing && (
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={handleProfileSave} style={{ flex: 1, padding: 14, background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  💾 Save Changes
                </button>
                <button onClick={() => setProfileEditing(false)} style={{ padding: "14px 24px", background: "#fff", color: "#555", border: "2px solid #f0f0f0", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            )}

            {/* DANGER ZONE */}
            <div style={{ marginTop: 40, padding: 20, border: "2px solid #fff0f0", borderRadius: 16, background: "#fff5f5" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#FF6B6B", marginBottom: 8 }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>These actions are permanent and cannot be undone.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleLogout} style={{ padding: "10px 20px", borderRadius: 12, border: "2px solid #FF6B6B", background: "#fff", color: "#FF6B6B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  🚪 Logout
                </button>
                <button onClick={() => { localStorage.removeItem("shopOwner"); localStorage.removeItem("shopOwnerLoggedIn"); localStorage.removeItem("shopProducts"); window.location.href = "/"; }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "#FF6B6B", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  🗑️ Delete My Shop
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ADD / EDIT FORM */}
        {activeTab === "add" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #f0f0f0", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>{editId ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Fresh Vegetables Combo" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Sale Price (₹) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 149" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Original Price (₹) *</label>
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="e.g. 199" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Stock Quantity *</label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="e.g. 50" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your product..." rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 10 }}>Product Image</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, border: "2px dashed #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, background: "#f9f9f9", overflow: "hidden" }}>
                    {form.image ? <img src={form.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : form.emoji}
                  </div>
                  <div>
                    <label style={{ display: "inline-block", padding: "10px 20px", background: "#FF6B6B", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      📷 Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                    <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>Or pick an emoji below</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {emojis.map((e) => (
                    <button key={e} onClick={() => setForm({ ...form, emoji: e, image: "" })} style={{ width: 44, height: 44, fontSize: 24, border: "2px solid", borderColor: form.emoji === e && !form.image ? "#FF6B6B" : "#f0f0f0", borderRadius: 10, background: form.emoji === e && !form.image ? "#fff5f5" : "#fff", cursor: "pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={handleSubmit} style={{ flex: 1, padding: 14, background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                {editId ? "✏️ Update Product" : "➕ Add Product"}
              </button>
              <button onClick={() => { setActiveTab("products"); setEditId(null); setForm(defaultForm); }} style={{ padding: "14px 24px", background: "#fff", color: "#555", border: "2px solid #f0f0f0", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTS LIST */}
        {activeTab === "products" && (
          <>
            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No products yet</h3>
                <p style={{ color: "#888", marginBottom: 24 }}>Start by adding your first product!</p>
                <button onClick={() => setActiveTab("add")} style={{ padding: "12px 28px", background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  ➕ Add First Product
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {products.map((product) => (
                  <div key={product.id} style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 40, width: 60, height: 60, background: "#f5f5f5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>{product.image ? <img src={product.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : product.emoji}</div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{product.name}</div>
                      <div style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{product.category} • Stock: {product.stock}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 100 }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>₹{product.price}</div>
                      <div style={{ fontSize: 13, color: "#aaa", textDecoration: "line-through" }}>₹{product.originalPrice}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => toggleActive(product.id)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", background: product.active ? "#d3f9d8" : "#f5f5f5", color: product.active ? "#2f9e44" : "#aaa" }}>
                        {product.active ? "● Active" : "○ Hidden"}
                      </button>
                      <button onClick={() => handleEdit(product)} style={{ padding: "8px 16px", borderRadius: 10, border: "2px solid #f0f0f0", background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#555" }}>✏️ Edit</button>
                      <button onClick={() => setDeleteConfirm(product.id)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#fff5f5", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#FF6B6B" }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.5)", padding: "20px 24px", textAlign: "center", fontSize: 13, marginTop: 40 }}>
        🛍️ LocalMart Dashboard • {shopOwner.shopName}
      </footer>
    </div>
  );
}

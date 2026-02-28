"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
  shopId: string;
  shopName: string;
};

// Sample shops data - later this will come from backend
const shopsData: Record<string, { name: string; emoji: string; type: string; distance: string; rating: number; reviews: number; open: boolean; banner: string; description: string }> = {
  "green-bazaar": { name: "Green Bazaar", emoji: "🏪", type: "Groceries", distance: "0.3 km", rating: 4.8, reviews: 320, open: true, banner: "#d3f9d8", description: "Fresh vegetables, fruits and groceries delivered from our farm to your door." },
  "anjali-fashions": { name: "Anjali Fashions", emoji: "👗", type: "Clothing", distance: "0.5 km", rating: 4.5, reviews: 180, open: true, banner: "#ffe8cc", description: "Trendy clothing for men, women and kids at the best prices in town." },
  "beauty-zone": { name: "Beauty Zone", emoji: "💅", type: "Cosmetics", distance: "0.8 km", rating: 4.9, reviews: 410, open: false, banner: "#ffd6e7", description: "Premium skincare, makeup and beauty products for every skin type." },
  "grain-house": { name: "Grain House", emoji: "🌾", type: "Groceries", distance: "1.1 km", rating: 4.7, reviews: 290, open: true, banner: "#fff3bf", description: "Your one-stop shop for all grains, pulses and daily essentials." },
  "daily-needs-store": { name: "Daily Needs Store", emoji: "🧴", type: "Daily Needs", distance: "0.6 km", rating: 4.6, reviews: 150, open: true, banner: "#e8f4ff", description: "Everything you need for your daily life at affordable prices." },
};

// Sample products - later will come from backend/dashboard
const sampleProducts: Product[] = [
  { id: 1, name: "Fresh Vegetables Combo", price: 149, originalPrice: 199, category: "Groceries", description: "Fresh seasonal vegetables packed daily", emoji: "🥦", stock: 50, active: true, shopId: "green-bazaar", shopName: "Green Bazaar" },
  { id: 2, name: "Fresh Fruits Basket", price: 199, originalPrice: 249, category: "Groceries", description: "Seasonal mixed fruits basket", emoji: "🍎", stock: 30, active: true, shopId: "green-bazaar", shopName: "Green Bazaar" },
  { id: 3, name: "Organic Milk 1L", price: 65, originalPrice: 75, category: "Groceries", description: "Pure organic cow milk", emoji: "🥛", stock: 100, active: true, shopId: "green-bazaar", shopName: "Green Bazaar" },
  { id: 4, name: "Spinach Bundle", price: 30, originalPrice: 40, category: "Groceries", description: "Fresh spinach bundle", emoji: "🥬", stock: 60, active: true, shopId: "green-bazaar", shopName: "Green Bazaar" },
  { id: 5, name: "Cotton Kurti Set", price: 599, originalPrice: 899, category: "Clothing", description: "Comfortable cotton kurti for daily wear", emoji: "👘", stock: 25, active: true, shopId: "anjali-fashions", shopName: "Anjali Fashions" },
  { id: 6, name: "Men's Casual Shirt", price: 449, originalPrice: 699, category: "Clothing", description: "Stylish casual shirt for men", emoji: "👕", stock: 40, active: true, shopId: "anjali-fashions", shopName: "Anjali Fashions" },
  { id: 7, name: "Kids Dress Set", price: 349, originalPrice: 499, category: "Clothing", description: "Cute dress set for kids", emoji: "👗", stock: 20, active: true, shopId: "anjali-fashions", shopName: "Anjali Fashions" },
  { id: 8, name: "Winter Jacket", price: 1299, originalPrice: 1899, category: "Clothing", description: "Warm winter jacket", emoji: "🧥", stock: 15, active: true, shopId: "anjali-fashions", shopName: "Anjali Fashions" },
  { id: 9, name: "Skincare Glow Kit", price: 349, originalPrice: 499, category: "Female Items", description: "Complete skincare routine kit", emoji: "✨", stock: 35, active: true, shopId: "beauty-zone", shopName: "Beauty Zone" },
  { id: 10, name: "Lipstick Combo Pack", price: 249, originalPrice: 399, category: "Female Items", description: "Set of 3 premium lipsticks", emoji: "💄", stock: 50, active: true, shopId: "beauty-zone", shopName: "Beauty Zone" },
  { id: 11, name: "Basmati Rice 5kg", price: 289, originalPrice: 350, category: "Groceries", description: "Premium basmati rice", emoji: "🌾", stock: 80, active: true, shopId: "grain-house", shopName: "Grain House" },
  { id: 12, name: "Aata 10kg", price: 350, originalPrice: 420, category: "Daily Needs", description: "Fresh ground wheat flour", emoji: "🌾", stock: 60, active: true, shopId: "grain-house", shopName: "Grain House" },
  { id: 13, name: "Toothpaste Combo", price: 120, originalPrice: 150, category: "Daily Needs", description: "Pack of 3 toothpastes", emoji: "🪥", stock: 90, active: true, shopId: "daily-needs-store", shopName: "Daily Needs Store" },
  { id: 14, name: "Hand Sanitizer Pack", price: 99, originalPrice: 130, category: "Daily Needs", description: "Pack of 2 sanitizers", emoji: "🧴", stock: 120, active: true, shopId: "daily-needs-store", shopName: "Daily Needs Store" },
];

export default function ShopPage() {
  const params = useParams();
  const shopId = params.id as string;
  const [shopInfo, setShopInfo] = useState<any>(shopsData[shopId] || null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [cart, setCart] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Get products for this shop (from sample + localStorage dashboard products)
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load registered shop from localStorage
    const registeredShops = JSON.parse(localStorage.getItem("allShops") || "[]");
    const registeredShop = registeredShops.find((s: any) => s.id === shopId);
    if (registeredShop) {
      setShopInfo({
        name: registeredShop.shopName,
        emoji: "🏪",
        type: registeredShop.category,
        distance: registeredShop.distance || "Nearby",
        rating: registeredShop.rating || 4.5,
        reviews: registeredShop.reviews || 0,
        open: registeredShop.open !== false,
        banner: "#f0f0f0",
        description: registeredShop.address,
      });
    }

    // Load products for this shop
    const shopProducts = JSON.parse(localStorage.getItem("shopProducts_" + shopId) || "[]");
    const productsWithShopId = shopProducts.map((p: any) => ({ ...p, shopId, shopName: registeredShop?.shopName || shopId }));
    setAllProducts(productsWithShopId);
  }, [shopId]);

  useEffect(() => {
    const stored = localStorage.getItem("shopProducts");
    const dashboardProducts: Product[] = stored ? JSON.parse(stored).map((p: Product) => ({ ...p, shopId: shopId, shopName: shop?.name || "My Shop" })) : [];
    const shopSampleProducts = sampleProducts.filter(p => p.shopId === shopId);
    setAllProducts([...shopSampleProducts, ...dashboardProducts]);
  }, [shopId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (id: number, name: string) => {
    setCart([...cart, id]);
    showToast(`✅ ${name} added to cart!`);
  };

  const categories = ["All", ...Array.from(new Set(allProducts.map(p => p.category)))];

  const filtered = allProducts.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.active;
  });

  if (!shop) {
    return (
      <div style={{ fontFamily: "sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 64 }}>🔍</div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Shop not found</h2>
        <a href="/" style={{ color: "#FF6B6B", fontWeight: 700, textDecoration: "none" }}>← Back to Home</a>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#FAFAF7", color: "#1a1a2e" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 12, fontWeight: 800, fontSize: 14, zIndex: 9999, background: "#1a1a2e", color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </a>
        <input type="text" placeholder="🔍 Search in this shop..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, margin: "0 24px", padding: "10px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600 }} />
        <a href="/cart" style={{ background: "#f5f5f5", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14, textDecoration: "none", color: "#1a1a2e", position: "relative" }}>
          🛒 Cart
          {cart.length > 0 && (
            <span style={{ position: "absolute", top: -6, right: -6, background: "#FF6B6B", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              {cart.length}
            </span>
          )}
        </a>
      </nav>

      {/* SHOP BANNER */}
      <div style={{ background: shop.banner, padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{shop.emoji}</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{shop.name}</h1>
        <p style={{ color: "#555", fontSize: 15, maxWidth: 500, margin: "0 auto 16px" }}>{shop.description}</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>📍 {shop.distance} away</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>⭐ {shop.rating} ({shop.reviews} reviews)</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: shop.open ? "#51CF66" : "#FF6B6B" }}>
            {shop.open ? "● Open Now" : "● Closed"}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>🏷️ {shop.type}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* CATEGORY FILTER */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 18px", borderRadius: 20, border: "2px solid", borderColor: activeCategory === cat ? "#FF6B6B" : "#f0f0f0", background: activeCategory === cat ? "#FF6B6B" : "#fff", color: activeCategory === cat ? "#fff" : "#555", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS COUNT */}
        <p style={{ color: "#888", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>{filtered.length} products available</p>

        {/* PRODUCTS GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No products found</h3>
            <p style={{ color: "#888" }}>Try a different category or search term</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {filtered.map((product) => (
              <div key={product.id} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f0f0f0", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div style={{ background: "#f5f5f5", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
                  {product.emoji}
                  {product.stock < 10 && product.stock > 0 && (
                    <span style={{ position: "absolute", top: 12, left: 12, background: "#FF922B", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 20 }}>Only {product.stock} left!</span>
                  )}
                  {product.stock === 0 && (
                    <span style={{ position: "absolute", top: 12, left: 12, background: "#aaa", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 20 }}>Out of Stock</span>
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
                  {product.description && <div style={{ fontSize: 12, color: "#888", marginBottom: 8, lineHeight: 1.4 }}>{product.description}</div>}
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#51CF66", marginBottom: 10 }}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontWeight: 900, fontSize: 20, color: "#1a1a2e" }}>₹{product.price}</span>
                      <span style={{ fontSize: 13, color: "#aaa", textDecoration: "line-through", marginLeft: 6 }}>₹{product.originalPrice}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product.id, product.name)}
                      disabled={product.stock === 0}
                      style={{ background: product.stock === 0 ? "#f0f0f0" : cart.includes(product.id) ? "#51CF66" : "#FF6B6B", color: product.stock === 0 ? "#aaa" : "#fff", border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: product.stock === 0 ? "not-allowed" : "pointer" }}
                    >
                      {product.stock === 0 ? "Sold Out" : cart.includes(product.id) ? "✓ Added" : "+ Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.5)", padding: "20px 24px", textAlign: "center", fontSize: 13, marginTop: 40 }}>
        🛍️ LocalMart • Supporting local businesses in Nangal, Punjab
      </footer>
    </div>
  );
}

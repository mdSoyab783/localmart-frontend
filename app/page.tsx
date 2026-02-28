"use client";

import { useState, useEffect } from "react";

const categories = [
  { id: 0, name: "All", icon: "🛍️", count: "All items", color: "#FF6B6B" },
  { id: 1, name: "Clothing", icon: "👗", count: "120+ items", color: "#FF6B6B" },
  { id: 2, name: "Groceries", icon: "🛒", count: "300+ items", color: "#51CF66" },
  { id: 3, name: "Female Items", icon: "💄", count: "80+ items", color: "#F06595" },
  { id: 4, name: "Daily Needs", icon: "🧴", count: "200+ items", color: "#339AF0" },
  { id: 5, name: "Electronics", icon: "📱", count: "50+ items", color: "#845EF7" },
  { id: 6, name: "Food & Snacks", icon: "🍱", count: "150+ items", color: "#FF922B" },
];

const featuredProductsData = [
  { id: 1, name: "Fresh Vegetables Combo", shop: "Green Bazaar", price: 149, originalPrice: 199, rating: 4.8, reviews: 120, tag: "Fresh", emoji: "🥦", color: "#d3f9d8", category: "Groceries" },
  { id: 2, name: "Cotton Kurti Set", shop: "Anjali Fashions", price: 599, originalPrice: 899, rating: 4.5, reviews: 85, tag: "Trending", emoji: "👘", color: "#ffe8cc", category: "Clothing" },
  { id: 3, name: "Skincare Glow Kit", shop: "Beauty Zone", price: 349, originalPrice: 499, rating: 4.9, reviews: 200, tag: "Popular", emoji: "✨", color: "#ffd6e7", category: "Female Items" },
  { id: 4, name: "Basmati Rice 5kg", shop: "Grain House", price: 289, originalPrice: 350, rating: 4.7, reviews: 310, tag: "Best Value", emoji: "🌾", color: "#fff3bf", category: "Groceries" },
];

const nearbyShops = [
  { id: 1, name: "Green Bazaar", type: "Groceries", distance: "0.3 km", open: true, emoji: "🏪" },
  { id: 2, name: "Anjali Fashions", type: "Clothing", distance: "0.5 km", open: true, emoji: "👗" },
  { id: 3, name: "Beauty Zone", type: "Cosmetics", distance: "0.8 km", open: false, emoji: "💅" },
  { id: 4, name: "Grain House", type: "Groceries", distance: "1.1 km", open: true, emoji: "🌾" },
];

export default function Homepage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cartCount, setCartCount] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [visible, setVisible] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState(featuredProductsData);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartCount(cartItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
    // Load products from all shop owners
    const allProducts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("shopProducts_")) {
        const prods = JSON.parse(localStorage.getItem(key) || "[]");
        allProducts.push(...prods);
      }
    }
    if (allProducts.length > 0) setFeaturedProducts(allProducts);
  }, []);

  const addToCart = (product: { id: number; name: string; price: number; originalPrice: number; emoji: string; shopName: string; size?: string }) => {
  const stored = localStorage.getItem("cartItems");
  const cartItems = stored ? JSON.parse(stored) : [];
  const existing = cartItems.find((i: { id: number }) => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, emoji: product.emoji, shopName: product.shopName, size: product.size || "", quantity: 1 });
  }
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  setCartCount(cartItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
};

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#FAFAF7", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAFAF7; }
        .fade-in { opacity: 0; transform: translateY(20px); animation: fadeUp 0.6s forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
        .btn-hover { transition: all 0.2s ease; cursor: pointer; }
        .btn-hover:hover { transform: scale(1.03); }
        .search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2); }
        .tag { font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: #FF6B6B; border-radius: 4px; }
        .shop-badge { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
        .nav-link { font-weight: 700; font-size: 14px; color: #555; cursor: pointer; transition: color 0.2s; }
        .nav-link:hover { color: #FF6B6B; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {[{ label: "Home", href: "/" }, { label: "Shops", href: "/shops" }, { label: "Offers", href: "/offers" }, { label: "Orders", href: "/orders" }].map((item) => (
            <a key={item.label} href={item.href} className="nav-link" style={{ textDecoration: "none", color: "#1a1a2e", fontWeight: 700, fontSize: 15 }}>{item.label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/cart" style={{ position: "relative", textDecoration: "none", color: "inherit" }} className="btn-hover">
            <div style={{ background: "#f5f5f5", padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              🛒 Cart
            </div>
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -6, background: "#FF6B6B", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                {cartCount}
              </span>
            )}
          </a>
          {user ? (<div onClick={() => { localStorage.removeItem("user"); setUser(null); }} style={{ background: "#1a1a2e", color: "#fff", padding: "8px 18px", borderRadius: 20, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>👤 {user.name} | Logout</div>) : (<a href="/auth" style={{ background: "#1a1a2e", color: "#fff", padding: "8px 18px", borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: "pointer", textDecoration: "none" }} className="btn-hover">Login</a>)}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "60px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,107,107,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "30%", width: 200, height: 200, borderRadius: "50%", background: "rgba(81,207,102,0.06)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }} className="fade-in">
          <div style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B", display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 800, marginBottom: 20, border: "1px solid rgba(255,107,107,0.3)" }}>
            📍 Taulihawa-Kapilvastu, Nepal
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
            Your Local Shops,<br />
            <span style={{ color: "#FF6B6B" }}>Now at Your Fingertips</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
            Order from your favorite local stores — groceries, clothing, daily essentials and more. Fast delivery, real savings.
          </p>

          {/* SEARCH BAR */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "6px 6px 6px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search products, shops, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, fontFamily: "inherit", color: "#1a1a2e", fontWeight: 600 }}
            />
            <button style={{ background: "#FF6B6B", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 800, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }} className="btn-hover">
              Search
            </button>
          </div>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 30 }}>
            {[["🏪", "50+ Shops"], ["📦", "Fast Delivery"], ["💰", "Best Prices"]].map(([icon, label]) => (
              <div key={label} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: "48px 24px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800 }}>Shop by Category</h2>
          <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>View All →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="card-hover fade-in"
              onClick={() => setActiveCategory(cat.name)}
              style={{
                background: activeCategory === cat.name ? cat.color : "#fff",
                border: `2px solid ${activeCategory === cat.name ? cat.color : "#f0f0f0"}`,
                borderRadius: 16,
                padding: "24px 16px",
                textAlign: "center",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{cat.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div style={{ padding: "24px 24px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800 }}>Featured Products</h2>
          <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>See All →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {featuredProducts.filter(p => activeCategory === "All" || p.category === activeCategory).map((product, i) => (
            <div
              key={product.id}
              className="card-hover fade-in"
              onClick={() => window.location.href = `/product/${product.id}`}
              style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f0f0f0", animationDelay: `${i * 0.1}s`, cursor: "pointer" }}
            >
              <div style={{ background: product.color || "#f5f5f5", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative", overflow: "hidden" }}>
                {product.image ? <img src={product.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : product.emoji}
                <span className="tag" style={{ position: "absolute", top: 12, left: 12, background: "#1a1a2e", color: "#fff" }}>
                  {product.tag}
                </span>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 700, marginBottom: 4 }}>🏪 {product.shop}</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{product.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>⭐ {product.rating}</span>
                  <span style={{ fontSize: 12, color: "#aaa" }}>({product.reviews} reviews)</span>
                </div>
                {product.category === "Clothing" && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {["S", "M", "L", "XL", "XXL"].map(size => (
                      <button key={size} onClick={() => setSelectedSizes({...selectedSizes, [product.id]: size})} style={{ padding: "4px 10px", borderRadius: 8, border: "2px solid", borderColor: selectedSizes[product.id] === size ? "#FF6B6B" : "#f0f0f0", background: selectedSizes[product.id] === size ? "#FF6B6B" : "#fff", color: selectedSizes[product.id] === size ? "#fff" : "#555", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{size}</button>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontWeight: 900, fontSize: 20, color: "#1a1a2e" }}>₹{product.price}</span>
                    <span style={{ fontSize: 13, color: "#aaa", textDecoration: "line-through", marginLeft: 6 }}>₹{product.originalPrice}</span>
                  </div>
                  <button
                    onClick={() => { if(product.category === "Clothing" && !selectedSizes[product.id]) { alert("Please select a size first!"); return; } addToCart({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, emoji: product.emoji, shopName: product.shop, size: selectedSizes[product.id] || "" }); }}
                    className="btn-hover"
                    style={{ background: "#FF6B6B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 800, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEARBY SHOPS */}
      <div style={{ padding: "0 24px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800 }}>Nearby Shops</h2>
          <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>View Map →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {nearbyShops.map((shop, i) => (
            <div
              key={shop.id}
              className="card-hover fade-in"
              style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0", animationDelay: `${i * 0.08}s` }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{shop.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{shop.name}</div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 10 }}>{shop.type}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>📍 {shop.distance}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: shop.open ? "#51CF66" : "#aaa" }}>
                  <span className="shop-badge" style={{ background: shop.open ? "#51CF66" : "#ccc" }} />
                  {shop.open ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BANNER */}
      <div style={{ margin: "0 auto 48px", maxWidth: 1100, padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", borderRadius: 24, padding: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#fff", fontWeight: 800, marginBottom: 8 }}>
              🚀 Become a Shop Partner
            </h3>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, maxWidth: 400 }}>
              List your local shop on LocalMart and reach thousands of customers in your area. It&apos;s free to get started!
            </p>
          </div>
          <a
            href="/dashboard"
            style={{ background: "#fff", color: "#FF6B6B", border: "none", padding: "14px 28px", borderRadius: 14, fontWeight: 900, fontSize: 15, fontFamily: "inherit", cursor: "pointer", textDecoration: "none" }}
          >
            Register Your Shop →
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.6)", padding: "30px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🛍️ LocalMart</div>
        <p style={{ fontSize: 13 }}>Supporting local businesses in Taulihawa-Kapilvastu, Nepal • Made with ❤️</p>
      </footer>
    </div>
  );
}

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

const isString = (value: unknown): value is string => typeof value === 'string';

export default function Homepage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cartCount, setCartCount] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [visible, setVisible] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [location, setLocation] = useState<string>("Detecting...");
  const [featuredProducts, setFeaturedProducts] = useState(featuredProductsData);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"trending" | "upcoming" | "offers">("trending");

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    // Auto rotate tabs every 4 seconds
    const tabInterval = setInterval(() => {
      setActiveTab(prev => prev === "trending" ? "upcoming" : prev === "upcoming" ? "offers" : "trending");
    }, 4000);
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    // Detect user location
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setLocation(savedLocation);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Your Location";
            const state = data.address?.state || "";
            const loc = state ? `${city}, ${state}` : city;
            setLocation(loc);
            localStorage.setItem("userLocation", loc);
          } catch {
            setLocation("Nangal, Punjab");
          }
        },
        () => setLocation("Nangal, Punjab")
      );
    } else {
      setLocation("Nangal, Punjab");
    }
    
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartCount(cartItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
    
    // Load products from all shop owners (both localStorage and MongoDB)
    const loadProducts = async () => {
      const allProducts: any[] = [];
      
      // First, load from localStorage
      const keys: (string | null)[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      keys.filter((key): key is string => key !== null && key.includes("shopProducts_"))
        .forEach((key) => {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            try {
              const prods = JSON.parse(storedData);
              allProducts.push(...prods);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        });
      
      // Then, fetch all products from MongoDB
      try {
        console.log("🔍 Fetching products from MongoDB...");
        const res = await fetch("http://localhost:8000/api/products");
        console.log("📡 MongoDB response status:", res.status);
        if (res.ok) {
          const mongoProducts = await res.json();
          console.log("✅ MongoDB products loaded:", mongoProducts.length, mongoProducts);
          // Convert MongoDB products to match our format
          mongoProducts.forEach((p: any) => {
            const productData = {
              id: p._id || Math.random(),
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice || p.price,
              rating: 4.5,
              reviews: Math.floor(Math.random() * 300),
              tag: "Available",
              emoji: p.emoji || "🛍️",
              color: "#e7f5ff",
              category: p.category || "Groceries",
              shop: p.shopName || "Local Shop"
            };
            console.log("Adding product:", productData);
            allProducts.push(productData);
          });
          console.log("Total products after MongoDB fetch:", allProducts.length);
        } else {
          console.log("❌ MongoDB response not OK:", res.statusText);
        }
      } catch (err) {
        console.log("❌ Failed to load products from MongoDB:", err);
      }
      
      if (allProducts.length > 0) setFeaturedProducts(allProducts);
    };
    
    loadProducts();
    
    return () => clearInterval(tabInterval);
  }, []);

  const addToCart = (product: { id: any; name: string; price: number; originalPrice: number; emoji: string; shopName?: string; shop?: string; size?: string }) => {
  const stored = localStorage.getItem("cartItems");
  const cartItems = stored ? JSON.parse(stored) : [];
  const existing = cartItems.find((i: { id: any }) => i.id === product.id);
  const shopName = product.shopName || product.shop || "Local Shop";
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, emoji: product.emoji, shopName: shopName, size: product.size || "", quantity: 1 });
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
        .tab-content { animation: tabFade 0.5s ease; }
        @keyframes tabFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tab-btn { transition: all 0.3s ease; }
        .tab-btn:hover { transform: scale(1.05); }
        .product-card-anim { animation: cardPop 0.4s ease forwards; }
        @keyframes cardPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes float { from { transform: translateY(0px) rotate(-4deg); } to { transform: translateY(-16px) rotate(4deg); } }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: "#1a1a2e", lineHeight: 1.2 }}>LocalMart</span>
            <span style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>📍 {location}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {[{ label: "Home", href: "/" }, { label: "Shops", href: "/shops" }, { label: "Offers", href: "/offers" }, { label: "Orders", href: "/orders" }].map((item) => (
            <a key={item.label} href={item.href} className="nav-link" style={{ textDecoration: "none", color: "#1a1a2e", fontWeight: 700, fontSize: 15 }}>{item.label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* SEARCH IN NAVBAR */}
          <div style={{ background: "#f5f5f5", borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8, width: 220 }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: 13, fontFamily: "inherit", color: "#1a1a2e", fontWeight: 600, width: "100%", outline: "none" }}
            />
          </div>
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
          {user ? (
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ background: "#1a1a2e", color: "#fff", padding: "6px 14px 6px 6px", borderRadius: 20, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "#FF6B6B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  {(user as any).avatar ? <img src={(user as any).avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                {user.name} ▾
              </div>
              {showUserMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", padding: 16, minWidth: 240, zIndex: 999, border: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {(user as any).avatar ? <img src={(user as any).avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: "#FF6B6B", fontWeight: 700 }}>LocalMart Member</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>📧 {user.email}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>📞 {(user as any).phone || "Not provided"}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>📍 {(user as any).address || "Not provided"}</div>
                  </div>
                  <div onClick={() => { localStorage.removeItem("user"); setUser(null); setShowUserMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", color: "#FF6B6B", fontWeight: 800, fontSize: 14, cursor: "pointer", borderRadius: 10, background: "#fff5f5" }}>
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          ) : (<a href="/auth" style={{ background: "#1a1a2e", color: "#fff", padding: "8px 18px", borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: "pointer", textDecoration: "none" }} className="btn-hover">Login</a>)}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "32px 24px", position: "relative", overflow: "hidden", minHeight: 420 }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,107,107,0.08)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* LEFT SIDE - Text + Tabs */}
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 42px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>Your Local Shops, <span style={{ color: "#FF6B6B" }}>Now at Your Fingertips</span></h1>



            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              Order from your favorite local stores — groceries, clothing, daily essentials and more.
            </p>

            {/* TABS */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[
                { key: "trending", label: "🔥 Trending" },
                { key: "upcoming", label: "🆕 New Arrivals" },
                { key: "offers", label: "🎉 Offers" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{ padding: "8px 18px", borderRadius: 24, border: "2px solid", borderColor: activeTab === tab.key ? "#FF6B6B" : "rgba(255,255,255,0.2)", background: activeTab === tab.key ? "#FF6B6B" : "rgba(255,255,255,0.06)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", position: "relative", overflow: "hidden" }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span style={{ position: "absolute", bottom: 0, left: 0, height: 3, background: "#fff", borderRadius: 2, animation: "progress 4s linear forwards" }} />
                  )}
                </button>
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600 }}>
              {activeTab === "trending" ? "🔥 Most popular products right now" : activeTab === "upcoming" ? "🆕 Freshly added to LocalMart" : "🎉 Best deals & discounts today"}
            </p>
          </div>

          {/* RIGHT SIDE - Product Cards Showcase */}
          <div style={{ position: "relative", height: "100%" }}>
            <div className="tab-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: "100%", alignContent: "stretch" }}>
              {featuredProducts
                .filter(p => {
                  if (activeTab === "offers") return (p as any).originalPrice > (p as any).price;
                  if (activeTab === "upcoming") return (p as any).id > 2;
                  return true;
                })
                .slice(0, 4)
                .map((p, i) => (
                  <div
                    key={p.id}
                    className="card-hover"
                    onClick={() => window.location.href = `/product/${p.id}`}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      animation: "cardPop 0.4s ease " + (i * 0.1) + "s both",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div style={{ width: 80, height: 80, borderRadius: 12, background: (p as any).color || "#ffffff15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, marginBottom: 8, overflow: "hidden" }}>
                      {(p as any).image
                        ? <img src={(p as any).image} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                        : p.emoji}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700 }}>🏪 {(p as any).shop || (p as any).shopName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>₹{p.price}</span>
                      <span style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>₹{p.originalPrice}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#51CF66" }}>{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% off</span>
                    </div>
                  </div>
                ))}
            </div>
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
                border: "2px solid " + (activeCategory === cat.name ? cat.color : "#f0f0f0") + "",
                borderRadius: 16,
                padding: "24px 16px",
                textAlign: "center",
                animationDelay: (i * 0.08) + "s",
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
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800 }}>{activeTab === "trending" ? "🔥 Trending Products" : activeTab === "upcoming" ? "🆕 New Arrivals" : "🎉 Today's Offers"}</h2>
          <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>See All →</span>
        </div>
        <div className="tab-content" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {featuredProducts.filter(p => {
              const matchCategory = activeCategory === "All" || p.category === activeCategory;
              if (activeTab === "offers") return matchCategory && p.originalPrice > p.price;
              if (activeTab === "upcoming") return matchCategory && p.id > 2;
              return matchCategory; // trending = all
            }).map((product, i) => (
            <div
              key={product.id}
              className="card-hover fade-in"
              onClick={() => window.location.href = `/product/${product.id}`}
              style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f0f0f0", animationDelay: (i * 0.1) + "s", cursor: "pointer" }}
            >
              <div style={{ background: product.color || "#f5f5f5", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative", overflow: "hidden" }}>
                {(product as any).image ? <img src={(product as any).image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : product.emoji}
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
              style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0", animationDelay: (i * 0.08) + "s" }}
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

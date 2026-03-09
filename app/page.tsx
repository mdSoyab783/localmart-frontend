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

      {/* NAVBAR - Flipkart Style */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
        <nav style={{ background: "#2874f0", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", minWidth: 100 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 22, color: "#fff", lineHeight: 1.1 }}>LocalMart</span>
            <span style={{ fontSize: 11, color: "#ffe0b2", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>📍 {location}</span>
          </a>
          <div style={{ flex: 1, background: "#fff", borderRadius: 4, display: "flex", alignItems: "center", padding: "6px 14px", gap: 10, maxWidth: 600 }}>
            <input className="search-input" type="text" placeholder="Search for products, brands and more" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: "#1a1a2e", fontWeight: 500, width: "100%", outline: "none" }} />
            <span style={{ fontSize: 18, color: "#2874f0", cursor: "pointer" }}>🔍</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: "auto" }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "#FF6B6B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {(user as any).avatar ? <img src={(user as any).avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  {user.name} ▾
                </div>
                {showUserMenu && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 12px)", background: "#fff", borderRadius: 4, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", padding: 16, minWidth: 240, zIndex: 999, border: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: "#2874f0", fontWeight: 700 }}>LocalMart Member</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>📧 {user.email}</div>
                    </div>
                    <a href="/orders" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", color: "#2874f0", fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: 6 }}>📦 My Orders</a>
                    <div onClick={() => { localStorage.removeItem("user"); setUser(null); setShowUserMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", color: "#FF6B6B", fontWeight: 800, fontSize: 14, cursor: "pointer", background: "#fff5f5" }}>🚪 Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/auth" style={{ background: "#fff", color: "#2874f0", padding: "8px 24px", borderRadius: 2, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Login</a>
            )}
            <a href="/cart" style={{ position: "relative", textDecoration: "none", color: "#fff", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14 }}>
              🛒 Cart
              {cartCount > 0 && (<span style={{ background: "#FF6B6B", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{cartCount}</span>)}
            </a>
          </div>
        </nav>
        <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 24px", display: "flex", alignItems: "center", overflowX: "auto", scrollbarWidth: "none" as "none" }}>
          {[{ label: "Home", href: "/", icon: "🏠" }, { label: "Shops", href: "/shops", icon: "🏪" }, { label: "Offers", href: "/offers", icon: "🎁" }, { label: "Orders", href: "/orders", icon: "📦" }, { label: "Clothing", href: "/shops?cat=clothing", icon: "👗" }, { label: "Groceries", href: "/shops?cat=groceries", icon: "🛒" }, { label: "Electronics", href: "/shops?cat=electronics", icon: "📱" }, { label: "Beauty", href: "/shops?cat=beauty", icon: "💄" }, { label: "Daily Needs", href: "/shops?cat=daily", icon: "🧴" }, { label: "Food", href: "/shops?cat=food", icon: "🍱" }, { label: "Sell on LocalMart", href: "/dashboard", icon: "🏪" }].map((item) => (
            <a key={item.label} href={item.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 18px", gap: 4, borderBottom: "2px solid transparent", whiteSpace: "nowrap" as "nowrap" }} onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#2874f0")} onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
      {/* BANNER CAROUSEL */}
      <div style={{ background: "#f1f3f6", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { bg: "linear-gradient(135deg, #e53935, #c62828)", title: "Big Saving Days", sub: "Min. 30% Off on Electronics", cta: "Shop Now", href: "/shops?cat=electronics" },
            { bg: "linear-gradient(135deg, #1565c0, #0d47a1)", title: "Fresh Groceries", sub: "Order from local stores daily", cta: "Order Now", href: "/shops?cat=groceries" },
            { bg: "linear-gradient(135deg, #2e7d32, #1b5e20)", title: "Fashion Week", sub: "Latest styles from local boutiques", cta: "Explore", href: "/shops?cat=clothing" },
          ].map((banner, i) => (
            <a key={i} href={banner.href} style={{ textDecoration: "none", background: banner.bg, borderRadius: 8, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", minHeight: 140 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 }}>LocalMart Deals</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{banner.title}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{banner.sub}</span>
              <span style={{ marginTop: "auto", background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 800, fontSize: 12, padding: "6px 14px", borderRadius: 4, alignSelf: "flex-start" }}>{banner.cta} →</span>
            </a>
          ))}
        </div>
      </div>
      {/* CATEGORIES */}
      <div style={{ background: "#fff", padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, marginBottom: 16, color: "#1a1a2e" }}>Shop by Category</h2>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" as "none", paddingBottom: 4 }}>
            {categories.map((cat) => (
              <div key={cat.id} onClick={() => setActiveCategory(cat.name)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 80, padding: "12px 8px", borderRadius: 8, background: activeCategory === cat.name ? "#e8f0fe" : "#f8f9fa", border: activeCategory === cat.name ? "2px solid #2874f0" : "2px solid transparent", transition: "all 0.2s" }}>
                <span style={{ fontSize: 28 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: activeCategory === cat.name ? "#2874f0" : "#333", textAlign: "center", whiteSpace: "nowrap" as "nowrap" }}>{cat.name}</span>
              </div>
            ))}
          </div>
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
      <div style={{ background: "#fff", padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>Nearby Shops</h2>
            <a href="/shops" style={{ color: "#2874f0", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>View All →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {nearbyShops.map((shop) => (
              <a key={shop.id} href="/shops" style={{ textDecoration: "none", background: "#f8f9fa", borderRadius: 8, padding: "16px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 32 }}>{shop.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>{shop.name}</div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{shop.type}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>📍 {shop.distance}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: shop.open ? "#2e7d32" : "#999", background: shop.open ? "#e8f5e9" : "#f5f5f5", padding: "2px 8px", borderRadius: 10 }}>{shop.open ? "Open" : "Closed"}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.6)", padding: "30px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🛍️ LocalMart</div>
        <p style={{ fontSize: 13 }}>Supporting local businesses • Made with ❤️</p>
      </footer>
    </div>
  );
}

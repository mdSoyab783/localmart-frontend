"use client";
import { useState, useEffect } from "react";

type Shop = {
  id: string;
  shopName: string;
  ownerName: string;
  category: string;
  address: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  distance?: string;
  open?: boolean;
  emoji?: string;
  productCount?: number;
};

const categoryColors: Record<string, string> = {
  "Groceries": "#51CF66",
  "Clothing": "#FF6B6B",
  "Female Items": "#F06595",
  "Daily Needs": "#339AF0",
  "Electronics": "#845EF7",
  "Food & Snacks": "#FF922B",
};

const categoryEmojis: Record<string, string> = {
  "Groceries": "🛒",
  "Clothing": "👗",
  "Female Items": "💄",
  "Daily Needs": "🧴",
  "Electronics": "📱",
  "Food & Snacks": "🍱",
};

// Sample shops
const sampleShops: Shop[] = [
  { id: "green-bazaar", shopName: "Green Bazaar", ownerName: "Ramesh Kumar", category: "Groceries", address: "Shop No. 5, Main Market, Nangal", rating: 4.8, reviews: 120, distance: "0.3 km", open: true, productCount: 45 },
  { id: "anjali-fashions", shopName: "Anjali Fashions", ownerName: "Anjali Sharma", category: "Clothing", address: "Shop No. 12, Nehru Market, Nangal", rating: 4.5, reviews: 85, distance: "0.5 km", open: true, productCount: 78 },
  { id: "beauty-zone", shopName: "Beauty Zone", ownerName: "Priya Singh", category: "Female Items", address: "Shop No. 3, Civil Lines, Nangal", rating: 4.9, reviews: 200, distance: "0.8 km", open: false, productCount: 120 },
  { id: "grain-house", shopName: "Grain House", ownerName: "Suresh Verma", category: "Groceries", address: "Near Bus Stand, Nangal", rating: 4.7, reviews: 310, distance: "1.1 km", open: true, productCount: 60 },
  { id: "daily-needs-store", shopName: "Daily Needs Store", ownerName: "Mohinder Singh", category: "Daily Needs", address: "Sector 4, Nangal Township", rating: 4.6, reviews: 95, distance: "0.6 km", open: true, productCount: 95 },
  { id: "techno-hub", shopName: "Techno Hub", ownerName: "Vikram Patel", category: "Electronics", address: "Main Bazaar, Nangal", rating: 4.4, reviews: 67, distance: "1.3 km", open: true, productCount: 40 },
];

const allCategories = ["All", "Groceries", "Clothing", "Female Items", "Daily Needs", "Electronics", "Food & Snacks"];

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadShops = async () => {
      // Clear old hardcoded shops from localStorage on first load
      const allShops = JSON.parse(localStorage.getItem("allShops") || "[]");
      const validShops = allShops.filter((s: any) => 
        s.id && s.shopName && !["ElectroMechanics", "All in One", "electromechanics", "allinone"].includes((s.shopName || "").toLowerCase().replace(/\s/g, ""))
      );
      localStorage.setItem("allShops", JSON.stringify(validShops));
      
      try {
        // Try to load shops from MongoDB - correct endpoint
        const res = await fetch("http://localhost:8000/api/shops");
        if (res.ok) {
          const mongoShops = await res.json();
          console.log("Loaded shops from MongoDB:", mongoShops);
          
          // Map MongoDB shops properly
          const mappedShops = mongoShops.map((shop: any) => ({
            id: shop._id || shop.id,
            shopName: shop.shopName,
            ownerName: shop.ownerName,
            category: shop.category || "Groceries",
            address: shop.address || "",
            phone: shop.phone,
            rating: shop.rating || 4.5,
            reviews: shop.reviews || 0,
            distance: "0 km",
            open: shop.open !== false
          }));
          
          // Update product counts
          const shopsWithCounts = mappedShops.map((shop: Shop) => {
            const products = JSON.parse(localStorage.getItem("shopProducts_" + shop.id) || "[]");
            return { ...shop, productCount: products.length };
          });
          
          setShops(shopsWithCounts);
          // Store in localStorage as source of truth
          localStorage.setItem("allShops", JSON.stringify(shopsWithCounts));
          return;
        }
      } catch (err) {
        console.log("MongoDB unavailable, using localStorage");
      }
      
      // Fallback: Load from localStorage
      const registeredShops = JSON.parse(localStorage.getItem("allShops") || "[]");
      const shopsWithCounts = registeredShops.map((shop: any) => {
        const products = JSON.parse(localStorage.getItem("shopProducts_" + shop.id) || "[]");
        return { ...shop, productCount: products.length };
      });
      setShops(shopsWithCounts);
    };
    
    loadShops();

    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartCount(cartItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
  }, []);

  const filtered = shops
    .filter(s => {
      const matchSearch = s.shopName.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "All" || s.category === activeCategory;
      const matchOpen = !showOpenOnly || s.open;
      return matchSearch && matchCategory && matchOpen;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "distance") return parseFloat(a.distance || "0") - parseFloat(b.distance || "0");
      if (sortBy === "products") return (b.productCount || 0) - (a.productCount || 0);
      return 0;
    });

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#FAFAF7", color: "#1a1a2e" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </a>
        <div style={{ display: "flex", gap: 24, fontSize: 15, fontWeight: 700 }}>
          <a href="/" style={{ textDecoration: "none", color: "#555" }}>Home</a>
          <a href="/shops" style={{ textDecoration: "none", color: "#FF6B6B" }}>Shops</a>
          <a href="/orders" style={{ textDecoration: "none", color: "#555" }}>Orders</a>
        </div>
        <a href="/cart" style={{ background: "#f5f5f5", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14, textDecoration: "none", color: "#1a1a2e", position: "relative" }}>
          🛒 Cart
          {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#FF6B6B", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{cartCount}</span>}
        </a>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8 }}>🏪 All Local Shops</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginBottom: 28 }}>Discover and shop from local businesses in Nangal, Punjab</p>

        {/* SEARCH */}
        <div style={{ maxWidth: 540, margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="Search shops, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "14px 20px 14px 48px", borderRadius: 16, border: "none", fontSize: 15, fontWeight: 600, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* FILTERS ROW */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid", borderColor: activeCategory === cat ? "#FF6B6B" : "#f0f0f0", background: activeCategory === cat ? "#FF6B6B" : "#fff", color: activeCategory === cat ? "#fff" : "#555", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {cat !== "All" && categoryEmojis[cat]} {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <input type="checkbox" checked={showOpenOnly} onChange={e => setShowOpenOnly(e.target.checked)} style={{ accentColor: "#FF6B6B" }} />
              Open Now
            </label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "2px solid #f0f0f0", fontWeight: 700, fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
              <option value="rating">⭐ Top Rated</option>
              <option value="distance">📍 Nearest</option>
              <option value="products">📦 Most Products</option>
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <p style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 20 }}>
          Showing {filtered.length} shop{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" && ` in ${activeCategory}`}
          {search && ` for "${search}"`}
        </p>

        {/* SHOPS GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏪</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No shops found</h3>
            <p style={{ color: "#888" }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filtered.map(shop => (
              <a key={shop.id} href={`/shop/${shop.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                >
                  {/* SHOP BANNER */}
                  <div style={{ height: 100, background: `linear-gradient(135deg, ${categoryColors[shop.category] || "#FF6B6B"}22, ${categoryColors[shop.category] || "#FF6B6B"}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
                    {categoryEmojis[shop.category] || "🏪"}
                    <span style={{ position: "absolute", top: 12, right: 12, background: shop.open ? "#51CF66" : "#aaa", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                      {shop.open ? "● Open" : "● Closed"}
                    </span>
                    <span style={{ position: "absolute", top: 12, left: 12, background: categoryColors[shop.category] || "#FF6B6B", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                      {shop.category}
                    </span>
                  </div>

                  {/* SHOP INFO */}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{shop.shopName}</div>
                    <div style={{ fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 10 }}>👤 {shop.ownerName}</div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      {shop.rating && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>⭐ {shop.rating} ({shop.reviews})</span>
                      )}
                      {shop.distance && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>📍 {shop.distance}</span>
                      )}
                    </div>

                    <div style={{ fontSize: 13, color: "#888", fontWeight: 600, marginBottom: 14 }}>📍 {shop.address}</div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B" }}>📦 {shop.productCount || 0} Products</span>
                      <span style={{ background: "#FF6B6B", color: "#fff", padding: "8px 16px", borderRadius: 10, fontWeight: 800, fontSize: 13 }}>
                        Visit Shop →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
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

"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Product = {
  id: number | string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  description: string;
  emoji: string;
  image?: string;
  stock: number;
  active: boolean;
  shopName?: string;
  shop?: string;
  rating?: number;
  reviews?: number;
  color?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;  // Keep as string to handle MongoDB IDs

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<any[]>([]);  // Add cart state to track changes

  useEffect(() => {
    const loadProduct = async () => {
      // Load product from all shop owners (localStorage)
      const allProducts: Product[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("shopProducts_")) {
          const prods = JSON.parse(localStorage.getItem(key) || "[]");
          allProducts.push(...prods);
        }
      }

      // Also check sample products
      const sampleProducts: Product[] = [
        { id: 1, name: "Fresh Vegetables Combo", price: 149, originalPrice: 199, category: "Groceries", description: "Fresh seasonal vegetables packed daily from local farms. Includes tomatoes, onions, potatoes, and more.", emoji: "🥦", stock: 50, active: true, shop: "Green Bazaar", rating: 4.8, reviews: 120, color: "#d3f9d8" },
        { id: 2, name: "Cotton Kurti Set", price: 599, originalPrice: 899, category: "Clothing", description: "Comfortable cotton kurti for daily wear. Available in multiple colors. Soft fabric, easy to wash.", emoji: "👘", stock: 25, active: true, shop: "Anjali Fashions", rating: 4.5, reviews: 85, color: "#ffe8cc" },
        { id: 3, name: "Skincare Glow Kit", price: 349, originalPrice: 499, category: "Female Items", description: "Complete skincare routine kit with face wash, moisturizer, and sunscreen. Suitable for all skin types.", emoji: "✨", stock: 35, active: true, shop: "Beauty Zone", rating: 4.9, reviews: 200, color: "#ffd6e7" },
        { id: 4, name: "Basmati Rice 5kg", price: 289, originalPrice: 350, category: "Groceries", description: "Premium aged basmati rice with long grains and aromatic flavor. Perfect for biryani and pulao.", emoji: "🌾", stock: 80, active: true, shop: "Grain House", rating: 4.7, reviews: 310, color: "#fff3bf" },
      ];

      // First try to find in localStorage products
      let found = [...allProducts, ...sampleProducts].find(p => {
        // Match by numeric id or string id
        return p.id === Number(productId) || String(p.id) === productId;
      });

      // If not found locally, try to fetch from MongoDB
      if (!found) {
        try {
          const res = await fetch("http://localhost:8000/api/products");
          if (res.ok) {
            const mongoProducts = await res.json();
            const mongoProduct = mongoProducts.find((p: any) => p._id === productId);
            if (mongoProduct) {
              found = {
                id: mongoProduct._id,
                name: mongoProduct.name,
                price: mongoProduct.price,
                originalPrice: mongoProduct.originalPrice || mongoProduct.price,
                category: mongoProduct.category || "Groceries",
                description: mongoProduct.description || "",
                emoji: mongoProduct.emoji || "🛍️",
                stock: mongoProduct.stock || 0,
                active: mongoProduct.active !== false,
                shopName: mongoProduct.shopName || "Local Shop",
                image: mongoProduct.image || undefined,
                rating: 4.5,
                reviews: Math.floor(Math.random() * 300),
                color: "#e7f5ff"
              };
            }
          }
        } catch (err) {
          console.log("Failed to fetch from MongoDB:", err);
        }
      }

      setProduct(found || null);
    };

    loadProduct();

    // Load cart items and count
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(items);
    setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
  }, [productId]);

  // Listen for cart changes to update available stock display
  useEffect(() => {
    const handleStorageChange = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItems(items);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate available stock based on cart
  const getAvailableStock = () => {
    if (!product) return 0;
    const cartQuantity = cartItems
      .filter((item: any) => String(item.id) === String(product.id))
      .reduce((sum: number, item: any) => sum + item.quantity, 0);
    return Math.max(0, product.stock - cartQuantity);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = () => {
    if (!product) return;
    if (product.category === "Clothing" && !selectedSize) {
      showToast("Please select a size first!", "error"); return;
    }
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const existing = cartItems.find((i: { id: number }) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        emoji: product.emoji,
        image: product.image || "",
        shopName: product.shopName || product.shop || "LocalMart",
        size: selectedSize,
        quantity,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setCartCount(cartItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
    showToast("✅ Added to cart successfully!", "success");
  };

  if (!product) return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h2 style={{ fontSize: 24, fontWeight: 800 }}>Product not found</h2>
      <a href="/" style={{ color: "#FF6B6B", fontWeight: 700, textDecoration: "none" }}>← Back to Home</a>
    </div>
  );

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#FAFAF7", color: "#1a1a2e" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", padding: "14px 28px", borderRadius: 14, fontWeight: 800, fontSize: 15, zIndex: 9999, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", background: toast.type === "success" ? "#1a1a2e" : "#FF6B6B", color: "#fff", whiteSpace: "nowrap" }}>
          {toast.message}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </a>
        <a href="/cart" style={{ background: "#f5f5f5", padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14, textDecoration: "none", color: "#1a1a2e", position: "relative" }}>
          🛒 Cart
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -6, right: -6, background: "#FF6B6B", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              {cartCount}
            </span>
          )}
        </a>
      </nav>

      {/* BREADCRUMB */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 24px", fontSize: 13, color: "#888", fontWeight: 600 }}>
        <a href="/" style={{ color: "#FF6B6B", textDecoration: "none" }}>Home</a> → <a href="/" style={{ color: "#FF6B6B", textDecoration: "none" }}>{product.category}</a> → {product.name}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

          {/* PRODUCT IMAGE */}
          <div>
            <div style={{ background: product.color || "#f5f5f5", borderRadius: 24, height: 380, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, overflow: "hidden", border: "1px solid #f0f0f0" }}>
              {product.image ? (
                <img src={product.image} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }} />
              ) : (
                product.emoji
              )}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div>
            {/* CATEGORY & SHOP */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span style={{ background: "#f0f0f0", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#555" }}>{product.category}</span>
              <span style={{ background: "#fff5f5", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#FF6B6B" }}>🏪 {product.shopName || product.shop}</span>
            </div>

            {/* NAME */}
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>{product.name}</h1>

            {/* RATING */}
            {product.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ fontSize: 16, color: star <= Math.round(product.rating!) ? "#FFD700" : "#f0f0f0" }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>{product.rating}</span>
                <span style={{ fontSize: 14, color: "#aaa" }}>({product.reviews} reviews)</span>
              </div>
            )}

            {/* PRICE */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#1a1a2e" }}>₹{product.price}</span>
              <span style={{ fontSize: 20, color: "#aaa", textDecoration: "line-through" }}>₹{product.originalPrice}</span>
              <span style={{ background: "#51CF66", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>{discount}% OFF</span>
            </div>

            {/* SAVINGS */}
            <div style={{ background: "#d3f9d8", padding: "10px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 700, color: "#2f9e44" }}>
              🎉 You save ₹{product.originalPrice - product.price} on this product!
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>📋 Product Description</h3>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, background: "#f9f9f9", padding: "14px 16px", borderRadius: 12 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.category === "Clothing" && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>📏 Select Size</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {["S", "M", "L", "XL", "XXL"].map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} style={{ width: 48, height: 48, borderRadius: 10, border: "2px solid", borderColor: selectedSize === size ? "#FF6B6B" : "#f0f0f0", background: selectedSize === size ? "#FF6B6B" : "#fff", color: selectedSize === size ? "#fff" : "#555", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>🔢 Quantity</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 40, height: 40, borderRadius: 10, border: "2px solid #f0f0f0", background: "#fff", fontWeight: 900, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontWeight: 800, fontSize: 18, minWidth: 32, textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: "#FF6B6B", fontWeight: 900, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>+</button>
                <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>({product.stock} in stock)</span>
              </div>
            </div>

            {/* ADD TO CART */}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={addToCart} style={{ flex: 1, padding: "16px", background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
                🛒 Add to Cart — ₹{product.price * quantity}
              </button>
              <a href="/cart" style={{ padding: "16px 20px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}>
                ⚡ Buy Now
              </a>
            </div>

            {/* DELIVERY INFO */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>🚚 Free delivery on orders above ₹499</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>🔄 Easy 7-day returns</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>🏪 Sold by {product.shopName || product.shop}</div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.5)", padding: "20px 24px", textAlign: "center", fontSize: 13 }}>
        🛍️ LocalMart • Supporting local businesses in Nangal, Punjab
      </footer>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  emoji: string;
  shopName: string;
  quantity: number;
  size?: string;
};

// Sample cart items - later will come from real product data
const sampleCartItems: CartItem[] = [
  { id: 1, name: "Fresh Vegetables Combo", price: 149, originalPrice: 199, emoji: "🥦", shopName: "Green Bazaar", quantity: 1 },
  { id: 2, name: "Basmati Rice 5kg", price: 289, originalPrice: 350, emoji: "🌾", shopName: "Grain House", quantity: 2 },
  { id: 3, name: "Skincare Glow Kit", price: 349, originalPrice: 499, emoji: "✨", shopName: "Beauty Zone", quantity: 1 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [coupon, setCoupon] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load cart from localStorage or use sample items
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      setCartItems(JSON.parse(stored));
    } else {
      setCartItems(sampleCartItems);
      localStorage.setItem("cartItems", JSON.stringify(sampleCartItems));
    }
  }, []);

  const saveCart = (updated: CartItem[]) => {
    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const updateQuantity = (id: number, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (id: number) => {
    saveCart(cartItems.filter((item) => item.id !== id));
    showToast("🗑️ Item removed from cart!", "success");
  };

  const applyCoupon = () => {
    if (couponApplied) { showToast("Coupon already applied!", "error"); return; }
    if (coupon.toUpperCase() === "LOCAL10") {
      setDiscount(10);
      setCouponApplied(true);
      showToast("🎉 Coupon applied! 10% discount!", "success");
    } else if (coupon.toUpperCase() === "SAVE50") {
      setDiscount(50);
      setCouponApplied(true);
      showToast("🎉 Coupon applied! ₹50 off!", "success");
    } else {
      showToast("❌ Invalid coupon code!", "error");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const savedAmount = originalTotal - subtotal;
  const couponDiscount = couponApplied && discount === 10 ? Math.round(subtotal * 0.1) : discount === 50 ? 50 : 0;
  const deliveryFee = subtotal > 499 ? 0 : 40;
  const finalTotal = subtotal - couponDiscount + deliveryFee;

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) { showToast("❌ Razorpay failed to load!", "error"); return; }
    
    // Allow guest checkout or use existing token
    const token = localStorage.getItem("token")?.replace(/^'|'$/g, "");
    const userStr = localStorage.getItem("user");
    const userData = userStr ? JSON.parse(userStr) : {};
    
    setLoading(true);
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = "Bearer " + token;
      }
      
      const res = await fetch("/api/payment", {
        method: "POST",
        headers,
        body: JSON.stringify({ amount: finalTotal })
      });
      
      if (!res.ok) {
        throw new Error("Payment request failed");
      }
      
      const data = await res.json();
      setLoading(false);
      
      // For mock payment, auto-complete after 1 second
      if (data.mock) {
        setTimeout(() => {
          showToast("✅ Payment successful! Order placed!", "success");
          handleCheckout();
        }, 1000);
        return;
      }
      
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "LocalMart",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async (response: any) => {
          showToast("✅ Payment successful! Order placed!", "success");
          await handleCheckout();
        },
        prefill: { name: userData?.name || "Guest", email: userData?.email || "" },
        theme: { color: "#FF6B6B" }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      showToast("❌ Payment failed. Try again!", "error");
      console.error("Payment error:", err);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) { showToast("Your cart is empty!", "error"); return; }
    setLoading(true);

      // Save order to localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
      // Save to MongoDB
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await fetch("http://localhost:8000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({
              items: cartItems,
              total: finalTotal,
              deliveryFee: deliveryFee,
              address: user?.address || "Nangal, Punjab",
              paymentMethod: "Cash on Delivery",
              status: "Confirmed"
            })
          });
        }
      } catch(err) { console.log("Order API error", err); }
      const newOrder = {
        orderId: "LM-" + Date.now(),
        date: new Date().toISOString().split("T")[0],
        status: "Confirmed",
        items: cartItems,
        total: finalTotal,
        deliveryFee: deliveryFee,
        address: user.address || "Nangal, Punjab",
        paymentMethod: "Cash on Delivery",
      };
      localStorage.setItem("userOrders", JSON.stringify([newOrder, ...existingOrders]));

      showToast("✅ Order placed successfully!", "success");
      saveCart([]);
  };

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
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>🛒 My Cart ({cartItems.length})</h1>
        <a href="/" style={{ fontSize: 14, fontWeight: 700, color: "#555", textDecoration: "none" }}>← Continue Shopping</a>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {cartItems.length === 0 ? (
          /* EMPTY CART */
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Your cart is empty!</h2>
            <p style={{ color: "#888", fontSize: 15, marginBottom: 32 }}>Looks like you haven't added anything yet.</p>
            <a href="/" style={{ background: "#FF6B6B", color: "#fff", padding: "14px 32px", borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
              🛍️ Start Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

            {/* CART ITEMS */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Cart Items ({cartItems.length})</h2>
                <button onClick={() => { saveCart([]); showToast("🗑️ Cart cleared!", "success"); }} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B", background: "none", border: "none", cursor: "pointer" }}>
                  Clear All
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 16 }}>

                    {/* EMOJI */}
                    <div style={{ width: 64, height: 64, background: "#f5f5f5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
                      {item.emoji}
                    </div>

                    {/* DETAILS */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#FF6B6B", fontWeight: 700, marginBottom: 4 }}>🏪 {item.shopName}</div>
                      {item.size && <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6 }}>📏 Size: <span style={{ background: "#FF6B6B", color: "#fff", padding: "2px 8px", borderRadius: 6 }}>{item.size}</span></div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 900, fontSize: 18, color: "#1a1a2e" }}>₹{item.price}</span>
                        <span style={{ fontSize: 13, color: "#aaa", textDecoration: "line-through" }}>₹{item.originalPrice}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#51CF66" }}>
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                      </div>
                    </div>

                    {/* QUANTITY */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid #f0f0f0", background: "#fff", fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FF6B6B", fontWeight: 900, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>+</button>
                    </div>

                    {/* ITEM TOTAL */}
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>₹{item.price * item.quantity}</div>
                      <button onClick={() => removeItem(item.id)} style={{ fontSize: 12, fontWeight: 700, color: "#FF6B6B", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* COUPON */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0", marginTop: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>🎟️ Apply Coupon</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code (try LOCAL10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={couponApplied}
                    style={{ flex: 1, padding: "10px 16px", border: "2px solid #f0f0f0", borderRadius: 10, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, background: couponApplied ? "#f9f9f9" : "#fff" }}
                  />
                  <button onClick={applyCoupon} disabled={couponApplied} style={{ padding: "10px 20px", background: couponApplied ? "#51CF66" : "#FF6B6B", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: couponApplied ? "default" : "pointer" }}>
                    {couponApplied ? "✓ Applied" : "Apply"}
                  </button>
                </div>
                {couponApplied && (
                  <p style={{ fontSize: 13, color: "#51CF66", fontWeight: 700, marginTop: 8 }}>✅ Coupon applied successfully!</p>
                )}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div style={{ position: "sticky", top: 80 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #f0f0f0" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Order Summary</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#555" }}>
                    <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#51CF66" }}>
                    <span>Savings</span>
                    <span>− ₹{savedAmount}</span>
                  </div>
                  {couponApplied && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#51CF66" }}>
                      <span>Coupon Discount</span>
                      <span>− ₹{couponDiscount}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#555" }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: deliveryFee === 0 ? "#51CF66" : "#1a1a2e" }}>{deliveryFee === 0 ? "FREE 🎉" : `₹${deliveryFee}`}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <p style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Add ₹{499 - subtotal} more for free delivery!</p>
                  )}
                </div>

                <div style={{ borderTop: "2px dashed #f0f0f0", paddingTop: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900 }}>
                    <span>Total</span>
                    <span style={{ color: "#FF6B6B" }}>₹{finalTotal}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (cartItems.length === 0) {
                      showToast("❌ Your cart is empty!", "error");
                      return;
                    }
                    window.location.href = "/checkout";
                  }}
                  style={{ width: "100%", padding: 16, background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: "pointer", marginBottom: 12 }}>
                  💳 Proceed to Checkout
                </button>

                <a href="/" style={{ display: "block", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#555", textDecoration: "none", padding: "10px 0" }}>
                  ← Continue Shopping
                </a>
              </div>

              {/* SAFE CHECKOUT */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1px solid #f0f0f0", marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>🔒 100% Secure Checkout</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>🏪 Local Shop Verified</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>🔄 Easy Returns & Refunds</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.5)", padding: "20px 24px", textAlign: "center", fontSize: 13, marginTop: 40 }}>
        🛍️ LocalMart • Supporting local businesses in Nangal, Punjab
      </footer>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  emoji: string;
  image?: string;
  shopName: string;
  quantity: number;
  size?: string;
};

type Order = {
  orderId: string;
  date?: string;
  createdAt?: string;
  status: "Pending" | "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled" | "Pending Payment";
  items: OrderItem[];
  total: number;
  deliveryFee?: number;
  address: string;
  paymentMethod: string;
};

const statusColors: Record<string, { bg: string; color: string; icon: string }> = {
  "Pending": { bg: "#fff3bf", color: "#e67700", icon: "⏳" },
  "Confirmed": { bg: "#e8f4ff", color: "#1971c2", icon: "✅" },
  "Out for Delivery": { bg: "#fff0f5", color: "#c2255c", icon: "🚚" },
  "Delivered": { bg: "#d3f9d8", color: "#2f9e44", icon: "🎉" },
  "Cancelled": { bg: "#fff5f5", color: "#c92a2a", icon: "❌" },
  "Pending Payment": { bg: "#fff3bf", color: "#e67700", icon: "⏳" },
};

// Sample orders - later will come from backend
const sampleOrders: Order[] = [
  {
    orderId: "LM-2024-001",
    date: "2024-02-15",
    status: "Delivered",
    items: [
      { id: 1, name: "Fresh Vegetables Combo", price: 149, emoji: "🥦", shopName: "Green Bazaar", quantity: 2 },
      { id: 2, name: "Basmati Rice 5kg", price: 289, emoji: "🌾", shopName: "Grain House", quantity: 1 },
    ],
    total: 587,
    deliveryFee: 0,
    address: "House No. 12, Main Market, Nangal",
    paymentMethod: "UPI",
  },
  {
    orderId: "LM-2024-002",
    date: "2024-02-20",
    status: "Out for Delivery",
    items: [
      { id: 3, name: "Skincare Glow Kit", price: 349, emoji: "✨", shopName: "Beauty Zone", quantity: 1 },
      { id: 4, name: "Cotton Kurti Set", price: 599, emoji: "👘", shopName: "Anjali Fashions", quantity: 1, size: "M" },
    ],
    total: 988,
    deliveryFee: 0,
    address: "House No. 12, Main Market, Nangal",
    paymentMethod: "Cash on Delivery",
  },
  {
    orderId: "LM-2024-003",
    date: "2024-02-25",
    status: "Confirmed",
    items: [
      { id: 5, name: "Hand Sanitizer Pack", price: 99, emoji: "🧴", shopName: "Daily Needs Store", quantity: 3 },
    ],
    total: 337,
    deliveryFee: 40,
    address: "House No. 12, Main Market, Nangal",
    paymentMethod: "UPI",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => { const run = async () => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    // Load orders from localStorage or use sample
    const storedOrders = localStorage.getItem("userOrders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders(sampleOrders);
    }
  }; run(); }, []);

  const filters = ["All", "Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"];

  const filteredOrders = orders.filter(o => activeFilter === "All" || o.status === activeFilter);

  const cancelOrder = (orderId: string) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: "Cancelled" as const } : o);
    setOrders(updated);
    localStorage.setItem("userOrders", JSON.stringify(updated));
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", color: "#1a1a2e" }}>

      {/* NAVBAR */}
      <nav style={{ background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#fff", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛍️</div>
          <span style={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>LocalMart</span>
        </a>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>📦 My Orders</h1>
        <a href="/" style={{ fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: 8 }}>← Continue Shopping</a>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* USER GREETING */}
        {user && (
          <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 16, padding: "28px 32px", marginBottom: 32, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 10px 30px rgba(102, 126, 234, 0.2)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>Hey, {user.name}! 👋</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Here are all your orders</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontWeight: 900, fontSize: 32, color: "#fff" }}>{orders.length}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Total Orders</div>
            </div>
          </div>
        )}

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "10px 20px", borderRadius: 24, border: "none", background: activeFilter === f ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#fff", color: activeFilter === f ? "#fff" : "#555", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: activeFilter === f ? "0 4px 15px rgba(102, 126, 234, 0.3)" : "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.3s ease" }}>
              {f} {f !== "All" && `(${orders.filter(o => o.status === f).length})`}
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 20px", background: "#fff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>📦</div>
            <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, color: "#1a1a2e" }}>No orders found</h3>
            <p style={{ color: "#888", marginBottom: 32, fontSize: 16 }}>You haven't placed any orders yet!</p>
            <a href="/" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", padding: "14px 32px", borderRadius: 12, fontWeight: 900, fontSize: 16, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)" }}>
              🛍️ Start Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {filteredOrders.map(order => (
              <div key={order.orderId} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)", transition: "all 0.3s ease" }}>

                {/* ORDER HEADER */}
                <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6, color: "#1a1a2e" }}>Order #{order.orderId}</div>
                    <div style={{ fontSize: 14, color: "#666", fontWeight: 700 }}>📅 {new Date(order.date || order.createdAt || new Date()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* STATUS BADGE */}
                    <span style={{ background: statusColors[order.status]?.bg || "#ddd", color: statusColors[order.status]?.color || "#666", padding: "8px 16px", borderRadius: 24, fontWeight: 900, fontSize: 14 }}>
                      {statusColors[order.status]?.icon || "📦"} {order.status}
                    </span>
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#667eea" }}>₹{order.total}</div>
                  </div>
                </div>

                {/* ORDER PROGRESS BAR */}
                {order.status !== "Cancelled" && (
                  <div style={{ padding: "20px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      {["Confirmed", "Out for Delivery", "Delivered"].map((step, i) => {
                        const steps = ["Confirmed", "Out for Delivery", "Delivered"];
                        const currentIndex = steps.indexOf(order.status);
                        const stepIndex = steps.indexOf(step);
                        const isCompleted = stepIndex <= currentIndex;
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: isCompleted ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: isCompleted ? "#fff" : "#aaa", fontWeight: 900 }}>
                                {isCompleted ? "✓" : i + 1}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 800, color: isCompleted ? "#667eea" : "#aaa", whiteSpace: "nowrap" }}>{step}</span>
                            </div>
                            {i < 2 && <div style={{ flex: 1, height: 3, background: stepIndex < currentIndex ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" : "#f0f0f0", margin: "0 6px", marginBottom: 24 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ORDER ITEMS PREVIEW */}
                <div style={{ padding: "20px 28px", display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px solid #f0f0f0" }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f9f9f9", padding: "10px 14px", borderRadius: 12 }}>
                      <span style={{ fontSize: 22 }}>{item.image ? <img src={item.image} style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6 }} /> : item.emoji}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>{item.name} {item.size && <span style={{ background: "#667eea", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{item.size}</span>}</div>
                        <div style={{ fontSize: 13, color: "#666", fontWeight: 700 }}>x{item.quantity} • ₹{item.price * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* EXPAND BUTTON */}
                <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)} style={{ fontSize: 14, fontWeight: 800, color: "#667eea", background: "none", border: "none", cursor: "pointer" }}>
                    {expandedOrder === order.orderId ? "▲ Hide Details" : "▼ View Details"}
                  </button>
                  <div style={{ display: "flex", gap: 10 }}>
                    {(order.status === "Pending" || order.status === "Confirmed") && (
                      <button onClick={() => cancelOrder(order.orderId)} style={{ padding: "8px 16px", borderRadius: 10, border: "2px solid #667eea", background: "#fff", color: "#667eea", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s ease" }}>
                        Cancel Order
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <button style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)" }}>
                        ⭐ Rate Order
                      </button>
                    )}
                    <a href="/" style={{ padding: "8px 16px", borderRadius: 10, border: "2px solid #e0e0e0", background: "#fff", color: "#555", fontWeight: 800, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>
                      🔄 Reorder
                    </a>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {expandedOrder === order.orderId && (
                  <div style={{ padding: "24px 28px", borderTop: "1px solid #f0f0f0", background: "#f9f9f9" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#667eea", marginBottom: 8 }}>📍 Delivery Address</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{order.address}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#667eea", marginBottom: 8 }}>💳 Payment Method</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{order.paymentMethod}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 8 }}>
                        <span>Subtotal</span>
                        <span>₹{order.total - (order.deliveryFee || 0)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 12 }}>
                        <span>Delivery Fee</span>
                        <span style={{ color: (order.deliveryFee || 0) === 0 ? "#51CF66" : "#1a1a2e", fontWeight: 900 }}>{(order.deliveryFee || 0) === 0 ? "FREE ✓" : `₹${order.deliveryFee}`}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, borderTop: "2px solid #667eea", paddingTop: 12, color: "#667eea" }}>
                        <span>Total Amount</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.6)", padding: "24px 24px", textAlign: "center", fontSize: 14, marginTop: 60, fontWeight: 700 }}>
        🛍️ LocalMart • Supporting local businesses in Nangal, Punjab
      </footer>
    </div>
  );
}

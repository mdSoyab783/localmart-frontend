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
  date: string;
  status: "Pending" | "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled";
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  address: string;
  paymentMethod: string;
};

const statusColors: Record<string, { bg: string; color: string; icon: string }> = {
  "Pending": { bg: "#fff3bf", color: "#e67700", icon: "⏳" },
  "Confirmed": { bg: "#e8f4ff", color: "#1971c2", icon: "✅" },
  "Out for Delivery": { bg: "#fff0f5", color: "#c2255c", icon: "🚚" },
  "Delivered": { bg: "#d3f9d8", color: "#2f9e44", icon: "🎉" },
  "Cancelled": { bg: "#fff5f5", color: "#c92a2a", icon: "❌" },
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

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    // Load orders from localStorage or use sample
    const storedOrders = localStorage.getItem("userOrders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders(sampleOrders);
    }
  }, []);

  const filters = ["All", "Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"];

  const filteredOrders = orders.filter(o => activeFilter === "All" || o.status === activeFilter);

  const cancelOrder = (orderId: string) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: "Cancelled" as const } : o);
    setOrders(updated);
    localStorage.setItem("userOrders", JSON.stringify(updated));
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#FAFAF7", color: "#1a1a2e" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </a>
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>📦 My Orders</h1>
        <a href="/" style={{ fontSize: 14, fontWeight: 700, color: "#555", textDecoration: "none" }}>← Continue Shopping</a>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

        {/* USER GREETING */}
        {user && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 24, border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Hey, {user.name}! 👋</div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Here are all your orders</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontWeight: 900, fontSize: 22 }}>{orders.length}</div>
              <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Total Orders</div>
            </div>
          </div>
        )}

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid", borderColor: activeFilter === f ? "#FF6B6B" : "#f0f0f0", background: activeFilter === f ? "#FF6B6B" : "#fff", color: activeFilter === f ? "#fff" : "#555", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {f} {f !== "All" && `(${orders.filter(o => o.status === f).length})`}
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No orders found</h3>
            <p style={{ color: "#888", marginBottom: 24 }}>You haven't placed any orders yet!</p>
            <a href="/" style={{ background: "#FF6B6B", color: "#fff", padding: "12px 28px", borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
              🛍️ Start Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredOrders.map(order => (
              <div key={order.orderId} style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0", overflow: "hidden" }}>

                {/* ORDER HEADER */}
                <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Order #{order.orderId}</div>
                    <div style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>📅 {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* STATUS BADGE */}
                    <span style={{ background: statusColors[order.status].bg, color: statusColors[order.status].color, padding: "6px 14px", borderRadius: 20, fontWeight: 800, fontSize: 13 }}>
                      {statusColors[order.status].icon} {order.status}
                    </span>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>₹{order.total}</div>
                  </div>
                </div>

                {/* ORDER PROGRESS BAR */}
                {order.status !== "Cancelled" && (
                  <div style={{ padding: "0 24px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      {["Confirmed", "Out for Delivery", "Delivered"].map((step, i) => {
                        const steps = ["Confirmed", "Out for Delivery", "Delivered"];
                        const currentIndex = steps.indexOf(order.status);
                        const stepIndex = steps.indexOf(step);
                        const isCompleted = stepIndex <= currentIndex;
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isCompleted ? "#51CF66" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                                {isCompleted ? "✓" : i + 1}
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: isCompleted ? "#51CF66" : "#aaa", whiteSpace: "nowrap" }}>{step}</span>
                            </div>
                            {i < 2 && <div style={{ flex: 1, height: 3, background: stepIndex < currentIndex ? "#51CF66" : "#f0f0f0", margin: "0 4px", marginBottom: 20 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ORDER ITEMS PREVIEW */}
                <div style={{ padding: "0 24px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9f9f9", padding: "8px 12px", borderRadius: 10 }}>
                      <span style={{ fontSize: 20 }}>{item.image ? <img src={item.image} style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4 }} /> : item.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name} {item.size && <span style={{ background: "#FF6B6B", color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{item.size}</span>}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>x{item.quantity} • ₹{item.price * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* EXPAND BUTTON */}
                <div style={{ padding: "12px 24px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)} style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B", background: "none", border: "none", cursor: "pointer" }}>
                    {expandedOrder === order.orderId ? "▲ Hide Details" : "▼ View Details"}
                  </button>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(order.status === "Pending" || order.status === "Confirmed") && (
                      <button onClick={() => cancelOrder(order.orderId)} style={{ padding: "6px 14px", borderRadius: 10, border: "2px solid #FF6B6B", background: "#fff", color: "#FF6B6B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        Cancel Order
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <button style={{ padding: "6px 14px", borderRadius: 10, border: "none", background: "#FF6B6B", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        ⭐ Rate Order
                      </button>
                    )}
                    <a href="/" style={{ padding: "6px 14px", borderRadius: 10, border: "2px solid #f0f0f0", background: "#fff", color: "#555", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
                      🔄 Reorder
                    </a>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {expandedOrder === order.orderId && (
                  <div style={{ padding: "20px 24px", borderTop: "1px solid #f0f0f0", background: "#f9f9f9" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#555", marginBottom: 4 }}>📍 Delivery Address</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{order.address}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#555", marginBottom: 4 }}>💳 Payment Method</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{order.paymentMethod}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                        <span>Subtotal</span>
                        <span>₹{order.total - order.deliveryFee}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                        <span>Delivery Fee</span>
                        <span style={{ color: order.deliveryFee === 0 ? "#51CF66" : "#1a1a2e" }}>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
                        <span>Total</span>
                        <span style={{ color: "#FF6B6B" }}>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                )}
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

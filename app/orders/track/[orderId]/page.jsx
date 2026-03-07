// app/orders/track/[orderId]/page.jsx  (or pages/orders/track/[orderId].jsx)
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

const STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const STATUS_ICONS = {
  Placed: "🛒",
  Confirmed: "✅",
  Packed: "📦",
  Shipped: "🚚",
  "Out for Delivery": "🏃",
  Delivered: "🎉",
};

export default function TrackOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState(null);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/track/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setOrder(data);
        setLiveStatus(data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Real-time Socket.io updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socket.emit("joinOrderRoom", orderId);

    socket.on("orderStatusUpdate", ({ status }) => {
      setLiveStatus(status);
      setOrder((prev) => prev ? { ...prev, status } : prev);
    });

    return () => socket.disconnect();
  }, [orderId]);

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading order details...</div>;
  if (!order) return <div className="text-center text-red-500 mt-10">Order not found.</div>;

  const currentIndex = STATUSES.indexOf(liveStatus || order.status);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", fontFamily: "sans-serif" }}>
      {/* NAVBAR */}
      <nav style={{ background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#fff", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛍️</div>
          <span style={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>LocalMart</span>
        </a>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>📦 Track Your Order</h1>
        <a href="/orders" style={{ fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: 8 }}>← My Orders</a>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1a1a2e", marginBottom: 8 }}>Track Your Order</h2>
          <p style={{ fontSize: 16, color: "#666", fontWeight: 700 }}>Order ID: <span style={{ fontFamily: "monospace", background: "#f0f0f0", padding: "4px 12px", borderRadius: 6 }}>{order.orderId}</span></p>
        </div>

        {/* Progress Stepper */}
        <div style={{ position: "relative", marginBottom: 40 }}>
          {STATUSES.map((status, index) => {
            const isDone = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={status} style={{ display: "flex", alignItems: "flex-start", marginBottom: index === STATUSES.length - 1 ? 0 : 32 }}>
                {/* Circle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 20 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 900,
                    border: "3px solid",
                    background: isDone ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#fff",
                    borderColor: isDone ? "#667eea" : "#ddd",
                    color: isDone ? "#fff" : "#999",
                    boxShadow: isCurrent ? "0 0 0 8px rgba(102, 126, 234, 0.15)" : "none",
                    transform: isCurrent ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.5s ease"
                  }}>
                    {STATUS_ICONS[status]}
                  </div>
                  {index < STATUSES.length - 1 && (
                    <div style={{
                      width: 2,
                      height: 48,
                      marginTop: 8,
                      background: index < currentIndex ? "linear-gradient(180deg, #667eea 0%, #764ba2 100%)" : "#ddd",
                      transition: "all 0.5s ease"
                    }} />
                  )}
                </div>
                {/* Label */}
                <div style={{ paddingTop: 6 }}>
                  <p style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: isCurrent ? "#667eea" : isDone ? "#1a1a2e" : "#999",
                    margin: 0
                  }}>
                    {status}
                    {isCurrent && <span style={{ marginLeft: 12, fontSize: 12, background: "#e7e5ff", color: "#667eea", padding: "4px 10px", borderRadius: "20px", fontWeight: 700 }}>Current</span>}
                  </p>
                  {/* Show timestamp from history */}
                  {order.statusHistory?.find((h) => h.status === status) && (
                    <p style={{ fontSize: 13, color: "#999", marginTop: 4, margin: 0 }}>
                      {new Date(order.statusHistory.find((h) => h.status === status).timestamp).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Delivery */}
        {order.estimatedDelivery && (
          <div style={{ background: "#e7e5ff", border: "2px solid #667eea", borderRadius: 12, padding: "16px 20px", marginBottom: 32, fontSize: 16, color: "#667eea", fontWeight: 700 }}>
            📅 Estimated Delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
          </div>
        )}

        {/* Order Summary */}
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "#1a1a2e", marginBottom: 16, margin: 0 }}>Order Summary</h2>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#666", padding: "12px 0", borderBottom: i !== order.items.length - 1 ? "1px solid #f0f0f0" : "none", fontWeight: 600 }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, color: "#667eea", marginTop: 16, paddingTop: 16, borderTop: "2px solid #f0f0f0" }}>
            <span>Total</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 16, padding: 24, fontSize: 15, color: "#666" }}>
            <p style={{ fontWeight: 900, color: "#1a1a2e", marginBottom: 12, fontSize: 16, margin: 0 }}>📍 Delivering to</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{order.shippingAddress.name} · {order.shippingAddress.phone}</p>
            <p style={{ margin: "4px 0 0 0", fontWeight: 600 }}>{order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}</p>
            <p style={{ margin: "4px 0 0 0", fontWeight: 600 }}>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
          </div>
        )}
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.6)", padding: "24px 24px", textAlign: "center", fontSize: 14, marginTop: 60, fontWeight: 700 }}>
        🛍️ LocalMart • Supporting local businesses in Nangal, Punjab
      </footer>
    </div>
  );
}

// app/admin/orders/page.jsx
"use client";
import { useEffect, useState } from "react";

const STATUSES = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const STATUS_COLORS = {
  Placed: "bg-gray-100 text-gray-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
};

// Notification statuses that trigger email/SMS
const NOTIFICATION_STATUSES = ["Confirmed", "Packed", "Out for Delivery", "Delivered"];

async function sendNotification(orderData, status) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: String(orderData._id).slice(-8).toUpperCase(),
        status,
        customerName: orderData.user?.name || orderData.userId?.name || "Customer",
        email: orderData.user?.email || orderData.userId?.email,
        phoneNumber: orderData.user?.phone || orderData.shippingAddress?.phone,
        totalAmount: orderData.totalAmount,
        address: orderData.shippingAddress ? `${orderData.shippingAddress.addressLine1}, ${orderData.shippingAddress.city}` : "Your address",
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Notification sent:", result);
      return { success: true, result };
    } else {
      const error = await response.json();
      console.error("Notification error:", error);
      return { success: false, error };
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error: String(error) };
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState(null);
  const [modal, setModal] = useState(null); // { order, status, note, estimatedDelivery }
  const [notificationStatus, setNotificationStatus] = useState(null); // Track notification status

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/orders/all${filterStatus ? `?status=${filterStatus}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch orders:", res.status);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const openUpdateModal = (order) => {
    const currentIndex = STATUSES.indexOf(order.status);
    const nextStatus = STATUSES[currentIndex + 1] || order.status;
    setModal({ order, status: nextStatus, note: "", estimatedDelivery: "" });
  };

  const handleUpdateStatus = async () => {
    if (!modal) return;
    setUpdating(modal.order._id);
    setNotificationStatus(null);
    try {
      // Update on backend first
      const response = await fetch(`/api/orders/${modal.order._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          status: modal.status,
          note: modal.note,
          estimatedDelivery: modal.estimatedDelivery,
        }),
      });

      if (!response.ok) {
        console.error("Backend update failed:", response.status);
        throw new Error(`Status ${response.status}`);
      }

      const updatedOrderData = await response.json();
      console.log("Order updated on backend:", updatedOrderData);

      // Send notifications if status requires it
      if (NOTIFICATION_STATUSES.includes(modal.status)) {
        setNotificationStatus("sending");
        const notificationResult = await sendNotification(modal.order, modal.status);
        
        if (notificationResult.success) {
          setNotificationStatus("sent");
          setTimeout(async () => {
            // Refresh orders after successful notification
            await fetchOrders();
            setNotificationStatus(null);
            setModal(null);
          }, 1000);
        } else {
          setNotificationStatus("failed");
          console.error("Notification failed:", notificationResult.error);
          setTimeout(async () => {
            // Still refresh orders even if notification failed
            await fetchOrders();
            setModal(null);
          }, 1000);
        }
      } else {
        // No notification needed, but still refresh orders
        setTimeout(async () => {
          await fetchOrders();
          setModal(null);
        }, 500);
      }
    } catch (err) {
      console.error("Update error:", err);
      setNotificationStatus("failed");
      setTimeout(() => {
        setUpdating(null);
        setModal(null);
      }, 2000);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Manage Orders</h1>
        <p className="text-gray-600 mb-8">Track and update customer orders in real-time</p>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-6 bg-white p-4 rounded-xl shadow-sm">
          {["", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all
                ${filterStatus === s ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 font-medium">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <p className="text-gray-500 text-lg font-medium">📭 No orders found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Order ID</th>
                    <th className="px-6 py-4 text-left font-bold">Customer</th>
                    <th className="px-6 py-4 text-left font-bold">Amount</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                    <th className="px-6 py-4 text-left font-bold">Date</th>
                    <th className="px-6 py-4 text-left font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-blue-700">{String(order._id).slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.user?.name}</p>
                        <p className="text-gray-600 text-xs">{order.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        {order.status !== "Delivered" ? (
                          <button
                            onClick={() => openUpdateModal(order)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                          >
                            Update Status
                          </button>
                        ) : (
                          <span className="text-green-600 text-sm font-bold">✅ Delivered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Update Order Status</h2>
              <p className="text-sm text-gray-600 mb-6">Order #{String(modal.order._id).slice(-8).toUpperCase()}</p>

              <label className="block text-sm font-bold text-gray-900 mb-2">New Status</label>
              <select
                value={modal.status}
                onChange={(e) => setModal({ ...modal, status: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                {STATUSES.slice(STATUSES.indexOf(modal.order.status) + 1).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {NOTIFICATION_STATUSES.includes(modal.status) && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm font-bold text-blue-700">📧 Notification Alert</p>
                  <p className="text-xs text-blue-600 mt-1">Customer will receive email & SMS when status is updated to <strong>{modal.status}</strong></p>
                </div>
              )}

              <label className="block text-sm font-bold text-gray-900 mb-2">Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Dispatched via Delhivery"
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <label className="block text-sm font-bold text-gray-900 mb-2">Estimated Delivery (optional)</label>
              <input
                type="date"
                value={modal.estimatedDelivery}
                onChange={(e) => setModal({ ...modal, estimatedDelivery: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {notificationStatus && (
                <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-bold text-center ${
                  notificationStatus === "sending" ? "bg-yellow-50 text-yellow-700 border-2 border-yellow-200" :
                  notificationStatus === "sent" ? "bg-green-50 text-green-700 border-2 border-green-200" :
                  "bg-red-50 text-red-700 border-2 border-red-200"
                }`}>
                  {notificationStatus === "sending" ? "📤 Sending notifications..." :
                   notificationStatus === "sent" ? "✅ Notifications sent to customer!" :
                   "❌ Failed to send notifications"}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating === modal.order._id || notificationStatus === "sending"}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold hover:shadow-lg transition disabled:opacity-50"
                >
                  {updating === modal.order._id ? "Updating..." : "Confirm Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

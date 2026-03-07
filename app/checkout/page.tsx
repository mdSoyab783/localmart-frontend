"use client";
import { useState, useEffect } from "react";

type CartItem = {
  id: number | string;
  name: string;
  price: number;
  emoji: string;
  shopName: string;
  quantity: number;
};

type DeliveryAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"address" | "payment" | "summary">("address");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    addressType: "home",
    isDefault: false,
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "wallet" | "cod">("cod");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [selectedBank, setSelectedBank] = useState("");

  // Pricing
  const [deliveryFee] = useState(50);
  const [discountPercent] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("cartItems");
    if (stored) setCartItems(JSON.parse(stored));

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.phone) {
      const defaultAddr: DeliveryAddress = {
        fullName: user.name || "",
        phone: user.phone || "",
        street: "Sector 15",
        city: "Chandigarh",
        state: "Punjab",
        zipCode: "160015",
        addressType: "home",
        isDefault: true,
      };
      setAddresses([defaultAddr]);
      setSelectedAddress(0);
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const total = subtotal + deliveryFee - discount;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddAddress = () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.zipCode) {
      showToast("❌ Please fill all address fields!", "error");
      return;
    }
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(addresses.length);
    setShowNewAddress(false);
    setNewAddress({ fullName: "", phone: "", street: "", city: "", state: "", zipCode: "", addressType: "home", isDefault: false });
    showToast("✅ Address added successfully!", "success");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && selectedAddress !== 0) {
      showToast("❌ Please select a delivery address!", "error");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const address = addresses[selectedAddress];

      const orderData = {
        items: cartItems,
        total,
        subtotal,
        discount,
        deliveryFee,
        paymentMethod,
        address: `${address.street}, ${address.city}, ${address.state} - ${address.zipCode}`,
        deliveryAddress: address,
        status: paymentMethod === "cod" ? "Confirmed" : "Pending Payment",
        createdAt: new Date(),
      };

      // Save to MongoDB if user is logged in
      if (token) {
        const res = await fetch("http://localhost:8000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(orderData),
        });
        if (!res.ok) console.log("Backend order save failed");
      }

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
      const newOrder = {
        orderId: "LM-" + Date.now(),
        ...orderData,
      };
      localStorage.setItem("userOrders", JSON.stringify([newOrder, ...existingOrders]));
      localStorage.setItem("cartItems", JSON.stringify([]));

      setStep("summary");
      showToast("✅ Order placed successfully!", "success");
      setTimeout(() => {
        window.location.href = "/orders";
      }, 2000);
    } catch (error) {
      console.error("Order error:", error);
      showToast("❌ Failed to place order!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "cod") {
      handlePlaceOrder();
      return;
    }

    if (paymentMethod === "upi" && !upiId) {
      showToast("❌ Please enter UPI ID!", "error");
      return;
    }

    if (paymentMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      showToast("❌ Please fill card details!", "error");
      return;
    }

    if (paymentMethod === "netbanking" && !selectedBank) {
      showToast("❌ Please select a bank!", "error");
      return;
    }

    // Mock payment processing
    setLoading(true);
    setTimeout(() => {
      showToast("✅ Payment successful!", "success");
      handlePlaceOrder();
    }, 2000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "20px" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 20px",
            backgroundColor: toast.type === "success" ? "#4CAF50" : "#f44336",
            color: "white",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>🛒 Checkout</h1>
          
          {/* Step Indicator */}
          <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
            {["address", "payment", "summary"].map((s, idx) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: step === s ? "#FF6B6B" : step > s ? "#4CAF50" : "#ddd",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontWeight: step === s ? "bold" : "normal", color: "#000", fontSize: "15px" }}>
                  {s === "address" ? "Delivery" : s === "payment" ? "Payment" : "Summary"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "20px" }}>
          {/* Main Content */}
          <div>
            {/* STEP 1: DELIVERY ADDRESS */}
            {step === "address" && (
              <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>📍 Delivery Address</h2>

                {/* Existing Addresses */}
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddress(idx)}
                    style={{
                      padding: "15px",
                      border: selectedAddress === idx ? "2px solid #FF6B6B" : "1px solid #ddd",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      cursor: "pointer",
                      backgroundColor: selectedAddress === idx ? "#fff5f5" : "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <div style={{ fontWeight: "bold", marginBottom: "5px", color: "#000", fontSize: "16px" }}>{addr.fullName}</div>
                        <div style={{ fontSize: "14px", color: "#333", marginBottom: "5px" }}>
                          {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                        </div>
                        <div style={{ fontSize: "14px", color: "#333" }}>📞 {addr.phone}</div>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Type: <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>{addr.addressType}</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === idx}
                        onChange={() => setSelectedAddress(idx)}
                        style={{ width: "20px", height: "20px", marginTop: "5px" }}
                      />
                    </div>
                  </div>
                ))}

                {/* Add New Address */}
                {!showNewAddress ? (
                  <button
                    onClick={() => setShowNewAddress(true)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px dashed #FF6B6B",
                      backgroundColor: "white",
                      color: "#FF6B6B",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "8px", marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", color: "#000", backgroundColor: "#fff" }}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", color: "#000", backgroundColor: "#fff" }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={handleAddAddress}
                        style={{
                          flex: 1,
                          padding: "10px",
                          backgroundColor: "#FF6B6B",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setShowNewAddress(false)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          backgroundColor: "#ddd",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "#000",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep("payment")}
                  disabled={selectedAddress === null && selectedAddress !== 0}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#FF6B6B",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "20px",
                    fontWeight: "bold",
                    opacity: selectedAddress === null && selectedAddress !== 0 ? 0.5 : 1,
                  }}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step === "payment" && (
              <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>💳 Payment Method</h2>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  style={{
                    padding: "15px",
                    border: paymentMethod === "cod" ? "2px solid #FF6B6B" : "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    backgroundColor: paymentMethod === "cod" ? "#fff5f5" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input type="radio" checked={paymentMethod === "cod"} onChange={() => {}} />
                  <div>
                    <div style={{ fontWeight: "bold", color: "#000", fontSize: "16px" }}>💵 Cash on Delivery</div>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "5px" }}>Pay when you receive your order</div>
                  </div>
                </div>

                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod("upi")}
                  style={{
                    padding: "15px",
                    border: paymentMethod === "upi" ? "2px solid #FF6B6B" : "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    backgroundColor: paymentMethod === "upi" ? "#fff5f5" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input type="radio" checked={paymentMethod === "upi"} onChange={() => {}} />
                  <div>
                    <div style={{ fontWeight: "bold", color: "#000", fontSize: "16px" }}>📱 UPI (Google Pay, PhonePe, Paytm)</div>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "5px" }}>Fast and secure payment</div>
                  </div>
                </div>
                {paymentMethod === "upi" && (
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., yourname@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      color: "#000",
                      backgroundColor: "#fff",
                    }}
                  />
                )}

                {/* Debit/Credit Card */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    padding: "15px",
                    border: paymentMethod === "card" ? "2px solid #FF6B6B" : "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    backgroundColor: paymentMethod === "card" ? "#fff5f5" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input type="radio" checked={paymentMethod === "card"} onChange={() => {}} />
                  <div>
                    <div style={{ fontWeight: "bold", color: "#000", fontSize: "16px" }}>💳 Debit / Credit Card</div>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "5px" }}>Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                {paymentMethod === "card" && (
                  <div style={{ marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="Card Number (16 digits)"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", color: "#000", backgroundColor: "#fff" }}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", color: "#000", backgroundColor: "#fff" }}
                      />
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                <div
                  onClick={() => setPaymentMethod("netbanking")}
                  style={{
                    padding: "15px",
                    border: paymentMethod === "netbanking" ? "2px solid #FF6B6B" : "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    backgroundColor: paymentMethod === "netbanking" ? "#fff5f5" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input type="radio" checked={paymentMethod === "netbanking"} onChange={() => {}} />
                  <div>
                    <div style={{ fontWeight: "bold", color: "#000", fontSize: "16px" }}>🏦 Net Banking</div>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "5px" }}>Direct bank transfer</div>
                  </div>
                </div>
                {paymentMethod === "netbanking" && (
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      color: "#000",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="">Select your bank</option>
                    <option value="sbi">State Bank of India (SBI)</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="boi">Bank of India</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                )}

                {/* Wallet */}
                <div
                  onClick={() => setPaymentMethod("wallet")}
                  style={{
                    padding: "15px",
                    border: paymentMethod === "wallet" ? "2px solid #FF6B6B" : "1px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: paymentMethod === "wallet" ? "#fff5f5" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input type="radio" checked={paymentMethod === "wallet"} onChange={() => {}} />
                  <div>
                    <div style={{ fontWeight: "bold", color: "#000", fontSize: "16px" }}>🎁 Wallet / Rewards</div>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "5px" }}>LocalMart Wallet Balance: ₹0</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    onClick={() => setStep("address")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#ddd",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#FF6B6B",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Processing..." : "Continue →"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUMMARY */}
            {step === "summary" && (
              <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px" }}>
                <div style={{ textAlign: "center", paddingBottom: "20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}>✅</div>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}>Order Confirmed!</h2>
                  <p style={{ color: "#666", marginTop: "10px" }}>Your order has been placed successfully.</p>
                  <p style={{ color: "#666" }}>You will receive a confirmation email shortly.</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "12px", position: "sticky", top: "20px" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "15px", color: "#000", fontSize: "16px" }}>Order Summary</h3>

              <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "10px" }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", color: "#333" }}>
                    <span>{item.emoji} {item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "13px", marginBottom: "8px", display: "flex", justifyContent: "space-between", color: "#333" }}>
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ fontSize: "13px", marginBottom: "8px", display: "flex", justifyContent: "space-between", color: "#333" }}>
                <span>Delivery Fee:</span>
                <span>₹{deliveryFee}</span>
              </div>
              {discount > 0 && (
                <div style={{ fontSize: "13px", marginBottom: "8px", display: "flex", justifyContent: "space-between", color: "#4CAF50" }}>
                  <span>Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div
                style={{
                  borderTop: "2px solid #eee",
                  paddingTop: "10px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "16px",
                  color: "#FF6B6B",
                }}
              >
                <span>Total:</span>
                <span>₹{Math.round(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

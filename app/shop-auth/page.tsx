"use client";
import { useState } from "react";

const categories = ["Groceries", "Clothing", "Female Items", "Daily Needs", "Electronics", "Food & Snacks"];

const defaultRegisterForm = {
  ownerName: "",
  shopName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  category: "Groceries",
  address: "",
  terms: false,
};

export default function ShopAuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    setRegisterForm({ ...registerForm, [target.name]: target.type === "checkbox" ? target.checked : target.value });
  };

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      showToast("Please fill in all fields!", "error"); return;
    }
    const stored = localStorage.getItem("shopOwner");
    if (!stored) { showToast("No shop account found! Please register first.", "error"); return; }
    const shopOwner = JSON.parse(stored);
    if (shopOwner.email !== loginForm.email || shopOwner.password !== loginForm.password) {
      showToast("Invalid email or password!", "error"); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("✅ Welcome back! Redirecting to dashboard...", "success");
      localStorage.setItem("shopOwnerLoggedIn", JSON.stringify({ email: shopOwner.email, shopName: shopOwner.shopName, ownerName: shopOwner.ownerName }));
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    }, 1500);
  };

  const handleRegister = () => {
    if (!registerForm.ownerName || !registerForm.shopName || !registerForm.email || !registerForm.phone || !registerForm.password || !registerForm.address) {
      showToast("Please fill in all required fields!", "error"); return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast("Passwords do not match!", "error"); return;
    }
    if (registerForm.password.length < 6) {
      showToast("Password must be at least 6 characters!", "error"); return;
    }
    if (!registerForm.terms) {
      showToast("Please accept the Terms & Conditions!", "error"); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const shopId = registerForm.shopName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const shopData = { ...registerForm, shopId };
      localStorage.setItem("shopOwner", JSON.stringify(shopData));
      localStorage.setItem("shopOwnerLoggedIn", JSON.stringify({ email: registerForm.email, shopName: registerForm.shopName, ownerName: registerForm.ownerName, shopId }));
      // Save to all shops list
      const allShops = JSON.parse(localStorage.getItem("allShops") || "[]");
      const shopEntry = { id: shopId, shopName: registerForm.shopName, ownerName: registerForm.ownerName, category: registerForm.category, address: registerForm.address, phone: registerForm.phone, rating: 0, reviews: 0, distance: "Nearby", open: true, productCount: 0 };
      const exists = allShops.find((s) => s.id === shopId);
      if (!exists) allShops.push(shopEntry);
      localStorage.setItem("allShops", JSON.stringify(allShops));
      showToast("🎉 Shop registered successfully! Redirecting to dashboard...", "success");
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#FAFAF7", display: "flex", flexDirection: "column" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", padding: "14px 28px", borderRadius: 14, fontWeight: 800, fontSize: 15, zIndex: 9999, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", background: toast.type === "success" ? "#1a1a2e" : "#FF6B6B", color: "#fff", whiteSpace: "nowrap" }}>
          {toast.message}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </a>
        <a href="/" style={{ fontSize: 14, fontWeight: 700, color: "#555", textDecoration: "none" }}>← Back to Store</a>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* CARD */}
          <div style={{ background: "#fff", borderRadius: 24, padding: "40px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>

            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{isLogin ? "🏪" : "🚀"}</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>
                {isLogin ? "Shop Owner Login" : "Register Your Shop"}
              </h1>
              <p style={{ color: "#888", fontSize: 14 }}>
                {isLogin ? "Login to manage your shop on LocalMart" : "Join LocalMart and reach thousands of customers"}
              </p>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 12, padding: 4, marginBottom: 28 }}>
              <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", background: !isLogin ? "#fff" : "transparent", color: !isLogin ? "#1a1a2e" : "#aaa", fontSize: 14 }}>
                🚀 Register Shop
              </button>
              <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", background: isLogin ? "#fff" : "transparent", color: isLogin ? "#1a1a2e" : "#aaa", fontSize: 14 }}>
                🔑 Login
              </button>
            </div>

            {/* LOGIN FORM */}
            {isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input type="email" name="email" placeholder="shop@example.com" value={loginForm.email} onChange={handleLoginChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555" }}>Password</label>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B", cursor: "pointer" }}>Forgot Password?</span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={loginForm.password} onChange={handleLoginChange} style={{ width: "100%", padding: "12px 48px 12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                    <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</span>
                  </div>
                </div>
                <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#ffb3b3" : "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
                  {loading ? "Please wait..." : "Login to Dashboard →"}
                </button>
              </div>
            )}

            {/* REGISTER FORM */}
            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Owner Name *</label>
                    <input type="text" name="ownerName" placeholder="Your full name" value={registerForm.ownerName} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Shop Name *</label>
                    <input type="text" name="shopName" placeholder="Your shop name" value={registerForm.shopName} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Email *</label>
                    <input type="email" name="email" placeholder="shop@example.com" value={registerForm.email} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Phone *</label>
                    <input type="tel" name="phone" placeholder="98765 43210" value={registerForm.phone} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Shop Category *</label>
                  <select name="category" value={registerForm.category} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, background: "#fff", boxSizing: "border-box" }}>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Shop Address *</label>
                  <input type="text" name="address" placeholder="e.g. Shop No. 5, Main Market, Nangal" value={registerForm.address} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Password *</label>
                    <input type="password" name="password" placeholder="Min 6 characters" value={registerForm.password} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Confirm Password *</label>
                    <input type="password" name="confirmPassword" placeholder="Re-enter password" value={registerForm.confirmPassword} onChange={handleRegisterChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, outline: "none", color: "#1a1a2e", fontWeight: 600, boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input type="checkbox" name="terms" checked={registerForm.terms} onChange={handleRegisterChange} style={{ marginTop: 3, width: 16, height: 16, cursor: "pointer", accentColor: "#FF6B6B" }} />
                  <span style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>I agree to LocalMart's <span style={{ color: "#FF6B6B", cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: "#FF6B6B", cursor: "pointer" }}>Privacy Policy</span></span>
                </div>

                <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#ffb3b3" : "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
                  {loading ? "Please wait..." : "🚀 Register My Shop"}
                </button>

              </div>
            )}
          </div>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#aaa" }}>
            {isLogin ? "Don't have a shop account? " : "Already registered? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: "#FF6B6B", cursor: "pointer", fontWeight: 800 }}>
              {isLogin ? "Register your shop →" : "Login here →"}
            </span>
          </p>
        </div>
      </div>

      <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.5)", padding: "20px 24px", textAlign: "center", fontSize: 13 }}>
        🛍️ LocalMart • Supporting local businesses in Nangal, Punjab
      </footer>
    </div>
  );
}

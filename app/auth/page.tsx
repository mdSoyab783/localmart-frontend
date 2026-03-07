"use client";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [avatar, setAvatar] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; password: string; confirmPassword: string; terms: boolean }>({
    name: "", email: "", phone: "", password: "", confirmPassword: "", terms: false
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Try canvas conversion first (works for HEIC on some browsers)
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no ctx");
        ctx.drawImage(img, 0, 0, 200, 200);
        const jpeg = canvas.toDataURL("image/jpeg", 0.8);
        setAvatar(jpeg);
      } catch {
        // Fallback: use FileReader directly
        const reader = new FileReader();
        reader.onloadend = () => setAvatar(reader.result as string);
        reader.readAsDataURL(file);
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      // HEIC not supported - use FileReader fallback
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) { showToast("Please fill in all required fields!", "error"); return; }
    if (!isLogin) {
      if (!form.name) { showToast("Please enter your full name!", "error"); return; }
      if (!form.phone) { showToast("Please enter your phone number!", "error"); return; }
      if (form.password !== form.confirmPassword) { showToast("Passwords do not match!", "error"); return; }
      if (form.password.length < 6) { showToast("Password must be at least 6 characters!", "error"); return; }
      if (!form.terms) { showToast("Please accept the Terms & Conditions!", "error"); return; }
    }
    setLoading(true);
    try {
      const API = "http://localhost:8000";
      if (isLogin) {
        const res = await fetch(API + "/api/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) { showToast("❌ " + data.message, "error"); setLoading(false); return; }
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        showToast("✅ Welcome back " + data.user.name + "!", "success");
        setTimeout(() => { window.location.href = "/"; }, 1500);
      } else {
        const res = await fetch(API + "/api/auth/signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, avatar: avatar || "" })
        });
        const data = await res.json();
        if (!res.ok) { showToast("❌ " + data.message, "error"); setLoading(false); return; }
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        showToast("🎉 Welcome to LocalMart, " + data.user.name + "!", "success");
        setTimeout(() => { window.location.href = "/"; }, 1500);
      }
    } catch (err) {
      showToast("❌ Server error. Make sure backend is running!", "error");
    }
    setLoading(false);
    return;
    // OLD CODE BELOW (disabled)
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        showToast("✅ Logged in successfully! Welcome back!", "success");
        // Get registered name from localStorage
        const registered = JSON.parse(localStorage.getItem("registeredUser") || "{}");
        const name = registered.email === form.email ? registered.name : form.email.split("@")[0];
        const userObj = { email: form.email, name, avatar: registered.avatar || "" };
        localStorage.setItem("user", JSON.stringify(userObj));
        setTimeout(() => { window.location.href = "/"; }, 2000);
      } else {
        showToast("🎉 Account created! Welcome to LocalMart!", "success");
        const newUser = { email: form.email, name: form.name, avatar };
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("registeredUser", JSON.stringify(newUser));
        setForm({ name: "", email: "", phone: "", password: "", confirmPassword: "", terms: false });
        setTimeout(() => setIsLogin(true), 2000);
      }
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

      <nav style={{ background: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ background: "#FF6B6B", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍️</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e" }}>LocalMart</span>
        </a>
        {user && (
          <span style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>👤 {user.name}</span>
        )}
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "40px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>

            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{isLogin ? "👋" : "🎉"}</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>{isLogin ? "Welcome Back!" : "Create Account"}</h1>
              <p style={{ color: "#888", fontSize: 14 }}>{isLogin ? "Login to your LocalMart account" : "Join LocalMart and start shopping locally"}</p>
            </div>

            <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 12, padding: 4, marginBottom: 28 }}>
              <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", background: isLogin ? "#fff" : "transparent", color: isLogin ? "#1a1a2e" : "#aaa" }}>Login</button>
              <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", background: !isLogin ? "#fff" : "transparent", color: !isLogin ? "#1a1a2e" : "#aaa" }}>Sign Up</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {!isLogin && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: avatar ? "#f0f0f0" : "linear-gradient(135deg, #FF6B6B, #FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, overflow: "hidden", border: "3px solid #FF6B6B" }}>
                  {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} alt="avatar" /> : "👤"}
                </div>
                <label htmlFor="avatar-upload" style={{ position: "absolute", bottom: 0, right: 0, background: "#FF6B6B", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                  📷
                </label>
                <input id="avatar-upload" type="file" accept="image/*, .heic, .heif" onChange={handleAvatarUpload} style={{ display: "none" }} />
              </div>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{avatar ? "✅ Photo uploaded!" : "Upload profile photo"}</span>
            </div>
          )}
          {!isLogin && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Full Name</label>
                  <input type="text" name="name" placeholder="Enter your full name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600 }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600 }} />
              </div>

              {!isLogin && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Phone Number</label>
                  <input type="tel" name="phone" placeholder="Enter your phone number" value={form.phone} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600 }} />
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} style={{ width: "100%", padding: "12px 48px 12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600 }} />
                  <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</span>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>Confirm Password</label>
                  <input type="password" name="confirmPassword" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 15, outline: "none", color: "#1a1a2e", fontWeight: 600 }} />
                </div>
              )}

              {!isLogin && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} style={{ marginTop: 3, width: 16, height: 16, cursor: "pointer", accentColor: "#FF6B6B" }} />
                  <span style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>I agree to the <span style={{ color: "#FF6B6B", cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: "#FF6B6B", cursor: "pointer" }}>Privacy Policy</span></span>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#ffb3b3" : "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
                {loading ? "Please wait..." : (isLogin ? "Login to LocalMart" : "Create My Account")}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
                <span style={{ fontSize: 13, color: "#bbb" }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button style={{ flex: 1, padding: 12, border: "2px solid #f0f0f0", borderRadius: 12, background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>🌐 Google</button>
                <button style={{ flex: 1, padding: 12, border: "2px solid #f0f0f0", borderRadius: 12, background: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>📱 Phone OTP</button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#aaa" }}>
            {isLogin ? "New to LocalMart? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: "#FF6B6B", cursor: "pointer", fontWeight: 800 }}>
              {isLogin ? "Create a free account →" : "Login here →"}
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

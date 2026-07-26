import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function SellerSignup() {
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !shopName.trim() || !whatsapp.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message || "Could not create account.");
      return;
    }

    if (!authData.user) {
      setLoading(false);
      setError("Check your email to confirm your account, then come back to sign in.");
      return;
    }

    const { error: insertError } = await supabase.from("sellers").insert({
      id: authData.user.id,
      full_name: fullName.trim(),
      shop_name: shopName.trim(),
      whatsapp_number: whatsapp.trim(),
      status: "pending",
    });

    setLoading(false);

    if (insertError) {
      setError("Account created, but we couldn't save your seller details. Please contact support.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>SAUKI</div>
          <div style={{ fontSize: 15, color: "#2C2C2A", marginBottom: 8, fontWeight: 500 }}>
            Application submitted
          </div>
          <div style={{ fontSize: 13.5, color: "#5F5E5A", lineHeight: 1.5 }}>
            Your seller account is pending approval. You'll be able to sign in and start uploading
            products once an admin approves your account.
          </div>
          <Link to="/seller/login" style={{ display: "inline-block", marginTop: 20, fontSize: 13.5, color: "#2C2C2A" }}>
            Go to seller sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#2C2C2A", marginBottom: 4, textAlign: "center" }}>
        SAUKI
      </div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 28, textAlign: "center" }}>
        Register as a seller
      </div>

      <form onSubmit={handleSignup}>
        <label style={labelStyle}>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Shop / business name</label>
        <input value={shopName} onChange={(e) => setShopName(e.target.value)} style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>WhatsApp number (with country code)</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="e.g. 2348012345678"
          inputMode="numeric"
          style={inputStyle}
        />

        <label style={{ ...labelStyle, marginTop: 14 }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        {error && <div style={{ color: "#993C1D", fontSize: 12.5, marginTop: 10 }}>{error}</div>}

        <button type="submit" disabled={loading} style={buttonStyle(loading)}>
          {loading ? "Submitting..." : "Submit application"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "#888780" }}>
        Already registered?{" "}
        <Link to="/seller/login" style={{ color: "#2C2C2A" }}>Sign in</Link>
      </div>
    </div>
  );
}

const pageStyle = { maxWidth: 380, margin: "0 auto", minHeight: "100vh", padding: "24px 20px" };
const labelStyle = { fontSize: 12.5, color: "#5F5E5A", fontWeight: 500, display: "block", marginBottom: 6 };
const inputStyle = {
  width: "100%", height: 42, borderRadius: 8, border: "1px solid #D3D1C7",
  padding: "0 12px", fontSize: 14, boxSizing: "border-box", color: "#2C2C2A", background: "#fff",
};
const buttonStyle = (loading) => ({
  width: "100%", height: 44, borderRadius: 8, border: "none",
  background: "#2C2C2A", color: "#fff", fontSize: 14.5, fontWeight: 500,
  cursor: loading ? "default" : "pointer", marginTop: 20, opacity: loading ? 0.7 : 1,
});

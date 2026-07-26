import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin/dashboard");
    });
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Incorrect email or password.");
      return;
    }
    navigate("/admin/dashboard");
  }

  return (
    <div style={{
      maxWidth: 380, margin: "0 auto", minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 20px",
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#2C2C2A", marginBottom: 4, textAlign: "center" }}>
        SAUKI
      </div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 28, textAlign: "center" }}>
        Admin sign in
      </div>

      <form onSubmit={handleLogin}>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && (
          <div style={{ color: "#993C1D", fontSize: 12.5, marginTop: 10 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", height: 44, borderRadius: 8, border: "none",
            background: "#2C2C2A", color: "#fff", fontSize: 14.5, fontWeight: 500,
            cursor: loading ? "default" : "pointer", marginTop: 20, opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { fontSize: 12.5, color: "#5F5E5A", fontWeight: 500, display: "block", marginBottom: 6 };
const inputStyle = {
  width: "100%", height: 42, borderRadius: 8, border: "1px solid #D3D1C7",
  padding: "0 12px", fontSize: 14, boxSizing: "border-box", color: "#2C2C2A", background: "#fff",
};

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { formatNaira, fileToDataUrl } from "../lib/helpers.js";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [view, setView] = useState("list");
  const [tab, setTab] = useState("products");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/admin");
      } else {
        setSession(data.session);
        setChecking(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!sess) navigate("/admin");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchProducts();
      fetchSellers();
    }
  }, [session]);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
  }

  async function fetchSellers() {
    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSellers(data);
  }

  async function updateSellerStatus(id, status) {
    const { error } = await supabase.from("sellers").update({ status }).eq("id", id);
    if (!error) {
      setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/admin");
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (checking) {
    return <div style={{ padding: 40, textAlign: "center", color: "#888780" }}>Loading...</div>;
  }

  const pendingCount = sellers.filter((s) => s.status === "pending").length;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "16px 16px 32px" }}>
      {view === "add" ? (
        <AddProductForm
          onDone={() => { setView("list"); fetchProducts(); }}
          onCancel={() => setView("list")}
        />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A" }}>SAUKI admin</div>
            <button onClick={handleSignOut} style={ghostBtnStyle}>Sign out</button>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            <button
              onClick={() => setTab("products")}
              style={tabBtnStyle(tab === "products")}
            >
              Products
            </button>
            <button
              onClick={() => setTab("sellers")}
              style={tabBtnStyle(tab === "sellers")}
            >
              Sellers {pendingCount > 0 && <span style={badgeStyle}>{pendingCount}</span>}
            </button>
          </div>

          {tab === "products" ? (
            <>
              <button
                onClick={() => setView("add")}
                style={{
                  width: "100%", height: 42, borderRadius: 8, border: "none",
                  background: "#2C2C2A", color: "#fff", fontSize: 14, fontWeight: 500,
                  cursor: "pointer", marginBottom: 18,
                }}
              >
                + Add product
              </button>

              {products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#888780", fontSize: 13.5 }}>
                  No products yet. Add your first one above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {products.map((p) => (
                    <div key={p.id} style={{
                      display: "flex", gap: 10, background: "#fff", border: "1px solid #E5E3DA",
                      borderRadius: 8, padding: 8, alignItems: "center",
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#F1EFE8" }}>
                        {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "#2C2C2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.name || "Untitled product"}
                        </div>
                        <div style={{ fontSize: 13, color: "#D85A30", fontWeight: 600, marginTop: 2 }}>
                          {formatNaira(p.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        style={{
                          width: 32, height: 32, borderRadius: 6, border: "1px solid #E5E3DA", background: "#fff",
                          cursor: "pointer", color: "#993C1D", flexShrink: 0, fontSize: 13,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sellers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#888780", fontSize: 13.5 }}>
                  No seller applications yet.
                </div>
              ) : (
                sellers.map((s) => (
                  <div key={s.id} style={{
                    background: "#fff", border: "1px solid #E5E3DA", borderRadius: 8, padding: 12,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>{s.shop_name}</div>
                        <div style={{ fontSize: 12.5, color: "#5F5E5A", marginTop: 2 }}>{s.full_name}</div>
                        <div style={{ fontSize: 12.5, color: "#5F5E5A" }}>WhatsApp: {s.whatsapp_number}</div>
                      </div>
                      <span style={statusPillStyle(s.status)}>{s.status}</span>
                    </div>
                    {s.status === "pending" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button
                          onClick={() => updateSellerStatus(s.id, "approved")}
                          style={{ flex: 1, height: 32, borderRadius: 6, border: "none", background: "#1D9E75", color: "#fff", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateSellerStatus(s.id, "rejected")}
                          style={{ flex: 1, height: 32, borderRadius: 6, border: "1px solid #E5E3DA", background: "#fff", color: "#993C1D", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {s.status === "approved" && (
                      <button
                        onClick={() => updateSellerStatus(s.id, "rejected")}
                        style={{ marginTop: 10, height: 30, padding: "0 10px", borderRadius: 6, border: "1px solid #E5E3DA", background: "#fff", color: "#993C1D", fontSize: 12, cursor: "pointer" }}
                      >
                        Revoke access
                      </button>
                    )}
                    {s.status === "rejected" && (
                      <button
                        onClick={() => updateSellerStatus(s.id, "approved")}
                        style={{ marginTop: 10, height: 30, padding: "0 10px", borderRadius: 6, border: "1px solid #E5E3DA", background: "#fff", color: "#1D9E75", fontSize: 12, cursor: "pointer" }}
                      >
                        Approve now
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const tabBtnStyle = (active) => ({
  flex: 1, height: 34, borderRadius: 7, border: active ? "none" : "1px solid #E5E3DA",
  background: active ? "#2C2C2A" : "#fff", color: active ? "#fff" : "#5F5E5A",
  fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
});

const badgeStyle = {
  background: "#D85A30", color: "#fff", fontSize: 10.5, fontWeight: 700,
  borderRadius: 10, padding: "1px 6px", minWidth: 16, textAlign: "center",
};

const statusPillStyle = (status) => ({
  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, textTransform: "capitalize",
  background: status === "approved" ? "#E4F5EE" : status === "rejected" ? "#FBEAEA" : "#FFF4E0",
  color: status === "approved" ? "#1D9E75" : status === "rejected" ? "#993C1D" : "#B87F1B",
});

function AddProductForm({ onDone, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 6 - images.length);
    if (files.length === 0) return;
    const urls = await Promise.all(files.map(fileToDataUrl));
    setImages((prev) => [...prev, ...urls].slice(0, 6));
    e.target.value = "";
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  const canSubmit = name.trim() && price.trim() && !Number.isNaN(Number(price)) && images.length >= 1 && !saving;

  async function submit() {
    if (!canSubmit) return;
    setSaving(true);
    setErrorMsg("");
    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      images,
    });
    setSaving(false);
    if (error) {
      setErrorMsg("Could not save product. Check your connection and try again.");
      return;
    }
    onDone();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button onClick={onCancel} style={ghostBtnStyle}>Back</button>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>Add product</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Photos ({images.length}/6, add at least 2-3)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: "1px solid #E5E3DA" }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", fontSize: 11,
                  cursor: "pointer", padding: 0, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: 8, border: "1.5px dashed #B4B2A9",
                background: "#F8F7F3", display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", cursor: "pointer", gap: 3, color: "#888780", fontSize: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>+</span>
              Add photo
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
      </div>

      <label style={labelStyle}>Product name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ankara fabric, 6 yards" style={inputStyle} />

      <label style={{ ...labelStyle, marginTop: 14 }}>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the product: material, size, color options, condition..."
        rows={4}
        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
      />

      <label style={{ ...labelStyle, marginTop: 14 }}>Price (₦)</label>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0.00"
        inputMode="decimal"
        style={inputStyle}
      />

      {errorMsg && <div style={{ color: "#993C1D", fontSize: 12.5, marginTop: 10 }}>{errorMsg}</div>}

      <button
        onClick={submit}
        disabled={!canSubmit}
        style={{
          width: "100%", height: 44, borderRadius: 8, border: "none",
          background: canSubmit ? "#2C2C2A" : "#D3D1C7", color: "#fff", fontSize: 14.5, fontWeight: 500,
          cursor: canSubmit ? "pointer" : "not-allowed", marginTop: 20,
        }}
      >
        {saving ? "Publishing..." : "Publish product"}
      </button>
    </div>
  );
}

const labelStyle = { fontSize: 12.5, color: "#5F5E5A", fontWeight: 500, display: "block", marginBottom: 6 };
const inputStyle = {
  width: "100%", height: 40, borderRadius: 8, border: "1px solid #D3D1C7",
  padding: "0 12px", fontSize: 14, boxSizing: "border-box", color: "#2C2C2A", background: "#fff",
};
const ghostBtnStyle = {
  height: 32, padding: "0 12px", borderRadius: 7, border: "1px solid #E5E3DA",
  background: "#fff", fontSize: 12.5, color: "#5F5E5A", cursor: "pointer",
};

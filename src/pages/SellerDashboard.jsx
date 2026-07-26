import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { formatNaira, fileToDataUrl } from "../lib/helpers.js";

export default function SellerDashboard() {
  const [checking, setChecking] = useState(true);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("list");
  const navigate = useNavigate();

  useEffect(() => {
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!sess) navigate("/seller/login");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function init() {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      navigate("/seller/login");
      return;
    }
    const userId = sessionData.session.user.id;
    const { data: sellerData, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !sellerData) {
      navigate("/seller/login");
      return;
    }

    setSeller(sellerData);
    setChecking(false);

    if (sellerData.status === "approved") {
      fetchProducts(userId);
    }
  }

  async function fetchProducts(userId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/seller/login");
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (checking) {
    return <div style={{ padding: 40, textAlign: "center", color: "#888780" }}>Loading...</div>;
  }

  if (seller.status === "pending") {
    return (
      <StatusScreen
        title="Application pending"
        message="Your seller account is still awaiting approval. You'll be able to upload products once an admin approves your account."
        onSignOut={handleSignOut}
      />
    );
  }

  if (seller.status === "rejected") {
    return (
      <StatusScreen
        title="Application not approved"
        message="Your seller application was not approved. Contact SAUKI support if you believe this is a mistake."
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "16px 16px 32px" }}>
      {view === "add" ? (
        <AddProductForm
          sellerId={seller.id}
          onDone={() => { setView("list"); fetchProducts(seller.id); }}
          onCancel={() => setView("list")}
        />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A" }}>{seller.shop_name}</div>
            <button onClick={handleSignOut} style={ghostBtnStyle}>Sign out</button>
          </div>
          <div style={{ fontSize: 12.5, color: "#888780", marginBottom: 18 }}>
            Seller dashboard — {seller.full_name}
          </div>

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
      )}
    </div>
  );
}

function StatusScreen({ title, message, onSignOut }) {
  return (
    <div style={{ maxWidth: 380, margin: "0 auto", minHeight: "100vh", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>SAUKI</div>
      <div style={{ fontSize: 15, color: "#2C2C2A", marginBottom: 8, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#5F5E5A", lineHeight: 1.5, marginBottom: 20 }}>{message}</div>
      <button onClick={onSignOut} style={ghostBtnStyle}>Sign out</button>
    </div>
  );
}

function AddProductForm({ sellerId, onDone, onCancel }) {
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
      seller_id: sellerId,
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

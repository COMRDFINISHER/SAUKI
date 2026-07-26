import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductErrorBoundary from "../components/ProductErrorBoundary.jsx";

const LIKES_KEY = "sauki:likes";

function loadLikes() {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [likes, setLikes] = useState(loadLikes());

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, sellers(shop_name, whatsapp_number)")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  function toggleLike(id) {
    const next = likes.includes(id) ? likes.filter((l) => l !== id) : [...likes, id];
    setLikes(next);
    localStorage.setItem(LIKES_KEY, JSON.stringify(next));
  }

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, background: "#F8F7F3", padding: "16px 14px 10px", zIndex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#2C2C2A", marginBottom: 12, letterSpacing: 0.5 }}>
          SAUKI
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#B4B2A9", fontSize: 14 }}>
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            style={{
              width: "100%", height: 40, borderRadius: 20, border: "1px solid #E5E3DA",
              background: "#fff", padding: "0 14px 0 34px", fontSize: 14, boxSizing: "border-box", color: "#2C2C2A",
            }}
          />
        </div>
      </div>

      <div style={{ padding: "6px 14px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#888780", fontSize: 13 }}>
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#888780" }}>
            <div style={{ fontSize: 14 }}>
              {products.length === 0 ? "No products yet. Check back soon." : "No products match your search."}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {filtered.map((p) => (
              <ProductErrorBoundary key={p.id}>
                <ProductCard product={p} liked={likes.includes(p.id)} onToggleLike={toggleLike} />
              </ProductErrorBoundary>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

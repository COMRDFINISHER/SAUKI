import ImageCarousel from "./ImageCarousel.jsx";
import { formatNaira, buildWhatsAppLink } from "../lib/helpers.js";

export default function ProductCard({ product, liked, onToggleLike }) {
  const seller = product.sellers;

  const handleOrder = () => {
    window.open(buildWhatsAppLink(product, seller?.whatsapp_number), "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid #E5E3DA",
      display: "flex",
      flexDirection: "column",
    }}>
      <ImageCarousel images={product.images} alt={product.name} />
      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {seller?.shop_name && (
          <div style={{ fontSize: 11, color: "#B4B2A9", fontWeight: 500 }}>
            {seller.shop_name}
          </div>
        )}
        <div style={{
          fontSize: 13, lineHeight: 1.35, color: "#2C2C2A", minHeight: 34,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.name || "Untitled product"}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#D85A30" }}>
          {formatNaira(product.price)}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <button onClick={handleOrder} style={orderBtnStyle}>
            Place order
          </button>
          <button
            aria-label={liked ? "Unlike" : "Like"}
            onClick={() => onToggleLike(product.id)}
            style={{
              width: 34, height: 34, borderRadius: 6, border: "1px solid #E5E3DA",
              background: liked ? "#FBEAF0" : "#fff", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 15,
              color: liked ? "#D4537E" : "#888780",
            }}
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
}

const orderBtnStyle = {
  flex: 1,
  height: 34,
  borderRadius: 6,
  border: "none",
  background: "#1D9E75",
  color: "#fff",
  fontSize: 12.5,
  fontWeight: 500,
  cursor: "pointer",
};

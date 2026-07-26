import { useState } from "react";

export default function ImageCarousel({ images, alt }) {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div style={{
        aspectRatio: "1", width: "100%", background: "#F1EFE8",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#B4B2A9", fontSize: 12,
      }}>
        No photo
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1", background: "#F1EFE8", overflow: "hidden" }}>
      <img
        src={images[idx]}
        alt={alt}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}
            style={navBtnStyle("left")}
          >
            ‹
          </button>
          <button
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}
            style={navBtnStyle("right")}
          >
            ›
          </button>
          <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i === idx ? "#fff" : "rgba(255,255,255,0.5)",
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 6,
    transform: "translateY(-50%)",
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    border: "none",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  };
}

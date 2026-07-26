export const WHATSAPP_NUMBER = "8619351703746";

export function formatNaira(value) {
  const n = Number(value);
  if (value == null || Number.isNaN(n)) return "₦0.00";
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildWhatsAppLink(product, sellerWhatsapp) {
  const number = (sellerWhatsapp || WHATSAPP_NUMBER).replace(/[^0-9]/g, "");
  const msg = `Hi, I'd like to order:\n${product.name}\nPrice: ${formatNaira(product.price)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

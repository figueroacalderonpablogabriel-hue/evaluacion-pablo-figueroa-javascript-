export const STORAGE_KEY = "tecnostock.cart";

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function normalizeCartFromStorage(rawCart, catalog = []) {
  if (!rawCart || typeof rawCart !== "object") return [];
  if (!Array.isArray(rawCart.items)) return [];

  const map = new Map(catalog.map((product) => [product.id, product]));
  const validItems = [];

  rawCart.items.forEach((entry) => {
    const id = Number(entry?.id);
    const qty = Number(entry?.qty);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1) return;

    const product = map.get(id);
    if (!product || !product.active || product.stock <= 0) return;
    if (qty > product.stock) return;

    validItems.push({ id, qty });
  });

  return validItems;
}

export function loadCartFromStorage(catalog = []) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return normalizeCartFromStorage(parsed, catalog);
  } catch (error) {
    console.error("El carrito guardado no es válido:", error);
    return [];
  }
}

export function saveCartToStorage(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.toJSON()));
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
}

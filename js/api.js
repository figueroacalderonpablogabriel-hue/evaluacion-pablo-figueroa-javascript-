export async function fetchProducts() {
  const response = await fetch("data/products.json");

  if (!response.ok) {
    throw new Error("No se pudo cargar el catálogo.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("El catálogo no tiene el formato esperado.");
  }

  return data.filter((product) => {
    if (!product || typeof product !== "object") return false;
    if (!Number.isInteger(product.id) || product.id <= 0) return false;
    if (typeof product.name !== "string" || !product.name.trim()) return false;
    if (typeof product.category !== "string" || !product.category.trim()) return false;
    if (!Number.isFinite(product.price) || product.price <= 0) return false;
    if (!Number.isInteger(product.stock) || product.stock < 0) return false;
    if (typeof product.active !== "boolean") return false;
    return true;
  });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

export async function fetchProducts() {
    const response = await fetch("data/products.json");
  
    if (!response.ok) {
      throw new Error("No se pudo cargar el catálogo.");
    }
  
    const data = await response.json();
  
    if (!Array.isArray(data)) {
      throw new Error("El catálogo no tiene el formato esperado.");
    }
  
    return data.filter((p) => p && typeof p === "object");
  }
  
  export function formatCurrency(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }
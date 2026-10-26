export async function fetchProducts() {
  const response = await fetch("./data/products.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (${response.status}).`);
  }

  const data = await response.json();
  return data;
}

export function saveCart(cart) {
  try {
    localStorage.setItem("tecnostock_cart", JSON.stringify(cart.items));
  } catch (error) {
    console.warn("No se pudo guardar el carrito:", error);
  }
}

export function loadCart() {
  try {
    const raw = localStorage.getItem("tecnostock_cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => Number.isInteger(item.id) && Number.isInteger(item.qty) && item.qty > 0);
  } catch (error) {
    console.warn("No se pudo leer el carrito:", error);
    return [];
  }
}

export function saveCart(cart) {
  try {
    if (!cart || !Array.isArray(cart.items)) {
      localStorage.setItem("tecnostock_cart", JSON.stringify([]));
      return;
    }

    const safeItems = cart.items.filter((item) => {
      return item && typeof item === "object" && Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.qty) && item.qty > 0;
    });

    localStorage.setItem("tecnostock_cart", JSON.stringify(safeItems));
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

    return parsed.filter((item) => {
      return item && typeof item === "object" && Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.qty) && item.qty > 0;
    });
  } catch (error) {
    console.warn("No se pudo leer el carrito:", error);
    return [];
  }
}

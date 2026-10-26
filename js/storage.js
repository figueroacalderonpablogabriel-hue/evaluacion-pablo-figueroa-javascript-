export class Cart {
  constructor(items = []) {
    this.items = Array.isArray(items) ? items : [];
  }

  get totalUnits() {
    return this.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }

  addProduct(product, qty = 1) {
    if (!product || typeof product !== "object") {
      throw new Error("El producto seleccionado no es válido.");
    }

    if (!product.active || product.stock <= 0) {
      throw new Error("Este producto no está disponible para agregar al carrito.");
    }

    const quantity = Number(qty);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("La cantidad debe ser un entero mayor o igual a 1.");
    }

    const existingItem = this.items.find((item) => item.id === product.id);
    const currentQty = existingItem ? Number(existingItem.qty) || 0 : 0;
    const nextQty = currentQty + quantity;

    if (nextQty > product.stock) {
      throw new Error(`La cantidad solicitada supera el inventario disponible (${product.stock}).`);
    }

    if (existingItem) {
      existingItem.qty = nextQty;
    } else {
      this.items.push({ id: product.id, qty: quantity });
    }

    return this;
  }

  updateQuantity(productId, newQty) {
    const id = Number(productId);
    if (!Number.isInteger(id)) {
      throw new Error("Identificador de producto inválido.");
    }

    const quantity = Number(newQty);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("La cantidad no puede ser negativa ni inválida.");
    }

    const item = this.items.find((entry) => entry.id === id);
    if (!item) {
      throw new Error("El producto no existe en el carrito.");
    }

    const product = globalThis.__TECNO_STOCK_CATALOG__?.find((entry) => entry.id === id);
    if (!product || !product.active || product.stock <= 0) {
      throw new Error("El producto ya no está disponible en el catálogo.");
    }

    if (quantity > product.stock) {
      throw new Error(`La cantidad no puede superar el inventario disponible (${product.stock}).`);
    }

    item.qty = quantity;
    return this;
  }

  increase(productId) {
    const id = Number(productId);
    if (!Number.isInteger(id)) throw new Error("Producto inválido.");

    const item = this.items.find((entry) => entry.id === id);
    if (!item) throw new Error("El producto no está en el carrito.");

    const product = globalThis.__TECNO_STOCK_CATALOG__?.find((entry) => entry.id === id);
    if (!product || !product.active || product.stock <= 0) {
      throw new Error("Este producto no está disponible para continuar.");
    }

    if (item.qty + 1 > product.stock) {
      throw new Error(`La cantidad máxima disponible es ${product.stock}.`);
    }

    item.qty += 1;
    return this;
  }

  decrease(productId) {
    const id = Number(productId);
    if (!Number.isInteger(id)) throw new Error("Producto inválido.");

    const item = this.items.find((entry) => entry.id === id);
    if (!item) throw new Error("El producto no está en el carrito.");

    if (item.qty <= 1) {
      this.removeProduct(id);
      return this;
    }

    item.qty -= 1;
    return this;
  }

  removeProduct(productId) {
    const id = Number(productId);
    if (!Number.isInteger(id)) throw new Error("Producto inválido.");
    this.items = this.items.filter((item) => item.id !== id);
    return this;
  }

  clear() {
    this.items = [];
    return this;
  }

  getSummary(catalog = []) {
    const map = new Map(catalog.map((product) => [product.id, product]));
    let subtotal = 0;

    for (const item of this.items) {
      const product = map.get(item.id);
      if (!product || !product.active) continue;
      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty < 1) continue;
      subtotal += product.price * qty;
    }

    const discount = subtotal >= 300000 ? subtotal * 0.1 : 0;
    return {
      subtotal,
      discount,
      total: subtotal - discount,
    };
  }

  toJSON() {
    return {
      items: this.items
        .map((item) => ({ id: Number(item.id), qty: Number(item.qty) }))
        .filter((item) => Number.isInteger(item.id) && Number.isInteger(item.qty) && item.qty > 0),
    };
  }
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

export function saveCartToStorage(cart) {
  try {
    localStorage.setItem("tecnostock.cart", JSON.stringify(cart.toJSON()));
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
}

export function loadCartFromStorage(catalog = []) {
  try {
    const saved = localStorage.getItem("tecnostock.cart");
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return normalizeCartFromStorage(parsed, catalog);
  } catch (error) {
    console.error("El carrito guardado no es válido:", error);
    return [];
  }
}

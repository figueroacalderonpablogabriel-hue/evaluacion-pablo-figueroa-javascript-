const STORAGE_KEY = "tecnostock.cart";

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function normalizeId(value) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export function isValidProduct(product) {
  if (!product || typeof product !== "object") return false;
  const id = normalizeId(product.id);
  const price = Number(product.price);
  const stock = Number(product.stock);
  if (id === null || !Number.isFinite(price) || price <= 0) return false;
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) return false;
  if (typeof product.name !== "string" || !product.name.trim()) return false;
  if (typeof product.description !== "string") return false;
  if (typeof product.category !== "string" || !product.category.trim()) return false;
  if (typeof product.active !== "boolean") return false;
  return true;
}

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
    const id = normalizeId(productId);
    if (id === null) {
      throw new Error("Identificador de producto inválido.");
    }

    const quantity = Number(newQty);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("La cantidad no puede ser negativa ni inválida.");
    }

    const itemIndex = this.items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error("El producto no existe en el carrito.");
    }

    const product = this.getProductById(id);
    if (!product) {
      throw new Error("El producto ya no está disponible en el catálogo.");
    }

    if (!product.active || product.stock <= 0) {
      throw new Error("No se puede mantener este producto en el carrito porque no está disponible.");
    }

    if (quantity > product.stock) {
      throw new Error(`La cantidad no puede superar el inventario disponible (${product.stock}).`);
    }

    this.items[itemIndex].qty = quantity;
    return this;
  }

  increase(productId) {
    const id = normalizeId(productId);
    if (id === null) throw new Error("Producto inválido.");

    const item = this.items.find((entry) => entry.id === id);
    if (!item) throw new Error("El producto no está en el carrito.");

    const product = this.getProductById(id);
    if (!product) throw new Error("El producto ya no existe en el catálogo.");
    if (!product.active || product.stock <= 0) {
      throw new Error("Este producto no está disponible para continuar.");
    }

    if (item.qty + 1 > product.stock) {
      throw new Error(`La cantidad máxima disponible es ${product.stock}.`);
    }

    item.qty += 1;
    return this;
  }

  decrease(productId) {
    const id = normalizeId(productId);
    if (id === null) throw new Error("Producto inválido.");

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
    const id = normalizeId(productId);
    if (id === null) throw new Error("Producto inválido.");
    this.items = this.items.filter((item) => item.id !== id);
    return this;
  }

  clear() {
    this.items = [];
    return this;
  }

  getProductById(productId) {
    const id = normalizeId(productId);
    if (id === null) return null;
    const product = globalThis.__TECNO_STOCK_CATALOG__ || [];
    return product.find((entry) => entry.id === id) || null;
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
      items: this.items.map((item) => ({
        id: normalizeId(item.id),
        qty: Number(item.qty),
      })).filter((item) => item.id !== null && Number.isInteger(item.qty) && item.qty > 0),
    };
  }
}

export function normalizeCartFromStorage(rawCart, catalog = []) {
  if (!rawCart || typeof rawCart !== "object") return [];

  if (!Array.isArray(rawCart.items)) {
    return [];
  }

  const map = new Map(catalog.map((product) => [product.id, product]));
  const validItems = [];

  rawCart.items.forEach((entry) => {
    const id = normalizeId(entry?.id);
    const qty = Number(entry?.qty);
    if (id === null || !Number.isInteger(qty) || qty < 1) return;

    const product = map.get(id);
    if (!product || !product.active || product.stock <= 0) return;
    if (qty > product.stock) return;

    validItems.push({ id, qty });
  });

  return validItems;
}

export function setCatalogReference(catalog) {
  globalThis.__TECNO_STOCK_CATALOG__ = Array.isArray(catalog) ? catalog : [];
}

export function getCatalogReference() {
  return Array.isArray(globalThis.__TECNO_STOCK_CATALOG__) ? globalThis.__TECNO_STOCK_CATALOG__ : [];
}

export function saveCartToStorage(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.toJSON()));
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
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

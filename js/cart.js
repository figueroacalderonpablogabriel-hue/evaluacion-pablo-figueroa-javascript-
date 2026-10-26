export class Cart {
  constructor(items = []) {
    this.items = Array.isArray(items) ? this.normalizeItems(items) : [];
  }

  normalizeItems(items) {
    return items.filter((item) => {
      return item && typeof item === "object" && Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.qty) && item.qty > 0;
    });
  }

  add(product) {
    if (!product || typeof product !== "object") {
      throw new Error("Producto inválido.");
    }

    if (!Number.isInteger(product.id) || product.id <= 0) {
      throw new Error("Producto inválido.");
    }

    if (!product.active || !Number.isInteger(product.stock) || product.stock <= 0) {
      throw new Error("Producto no disponible.");
    }

    const existing = this.items.find((item) => item.id === product.id);

    if (existing) {
      const nextQty = existing.qty + 1;
      if (nextQty > product.stock) {
        throw new Error("No hay suficiente stock.");
      }
      existing.qty = nextQty;
      return;
    }

    this.items.push({ id: product.id, qty: 1 });
  }

  update(productId, change) {
    if (!Number.isInteger(productId) || productId <= 0) return;
    if (!Number.isInteger(change)) return;

    const item = this.items.find((entry) => entry.id === productId);
    if (!item) return;

    const nextQty = item.qty + change;

    if (nextQty <= 0) {
      this.items = this.items.filter((entry) => entry.id !== productId);
      return;
    }

    item.qty = nextQty;
  }

  remove(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
  }

  clear() {
    this.items = [];
  }

  getTotalUnits() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  getSummary(products) {
    const map = new Map(products.map((product) => [product.id, product]));
    let subtotal = 0;

    this.items.forEach((item) => {
      const product = map.get(item.id);
      if (!product) return;
      subtotal += product.price * item.qty;
    });

    const discount = subtotal >= 300000 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    return { subtotal, discount, total };
  }
}

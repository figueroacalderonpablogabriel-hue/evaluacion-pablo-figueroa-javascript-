export class Cart {
    constructor(items = []) {
      this.items = Array.isArray(items) ? items : [];
    }
  
    add(product) {
      const exist = this.items.find(item => item.id === product.id);
  
      if (!product.active || product.stock <= 0) {
        throw new Error("Producto no disponible.");
      }
  
      if (exist) {
        if (exist.qty + 1 > product.stock) {
          throw new Error("No hay suficiente stock.");
        }
        exist.qty += 1;
      } else {
        this.items.push({ id: product.id, qty: 1 });
      }
    }
  
    update(productId, change) {
      const item = this.items.find(i => i.id === productId);
  
      if (!item) return;
  
      item.qty += change;
  
      if (item.qty <= 0) {
        this.items = this.items.filter(i => i.id !== productId);
      }
    }
  
    remove(productId) {
      this.items = this.items.filter(i => i.id !== productId);
    }
  
    clear() {
      this.items = [];
    }

    getTotalUnits() {
      return this.items.reduce((sum, item) => sum + item.qty, 0);
    }
      
    getSummary(products) {
      const map = new Map(products.map(p => [p.id, p]));
      let subtotal = 0;
  
      this.items.forEach(item => {
        const product = map.get(item.id);
        if (!product) return;
        subtotal += product.price * item.qty;
      });  
      const discount = subtotal >= 300000 ? subtotal * 0.10 : 0;
      const total = subtotal - discount;
  
      return { subtotal, discount, total };
    }
  }
class ShoppingCart extends HTMLElement {
  set cart(value) {
    this._cart = value || { items: [] };
    this.render();
  }

  set catalog(value) {
    this._catalog = Array.isArray(value) ? value : [];
    this.render();
  }

  render() {
    const cart = this._cart || { items: [] };
    const catalog = Array.isArray(this._catalog) ? this._catalog : [];

    if (!cart.items || cart.items.length === 0) {
      this.innerHTML = '<div class="empty">Tu carrito está vacío.</div>';
      return;
    }

    const map = new Map(catalog.map(p => [p.id, p]));
    const summary = cart.getSummary(catalog);

    this.innerHTML = `
      <ul>
        ${cart.items.map(item => {
          const product = map.get(item.id);
          if (!product) return "";
          return `
            <li>
              <div>
                <strong>${product.name}</strong><br>
                <small>${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(product.price)} c/u</small>
              </div>
              <div class="cart-actions">
                <button type="button" data-action="decrease" data-id="${product.id}">-</button>
                <span>${item.qty}</span>
                <button type="button" data-action="increase" data-id="${product.id}">+</button>
                <button type="button" data-action="remove" data-id="${product.id}">X</button>
              </div>
            </li>
          `;
        }).join("")}
      </ul>
      <div class="summary" style="margin-top:12px;">
        <div class="row"><span>Subtotal</span><span>${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(summary.subtotal)}</span></div>
        <div class="row"><span>Descuento</span><span>${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(summary.discount)}</span></div>
        <div class="row total"><span>Total</span><span>${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(summary.total)}</span></div>
      </div>
    `;

    this.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const productId = Number(button.dataset.id);
        this.dispatchEvent(new CustomEvent("cart-action", {
          detail: { action, productId },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define("shopping-cart", ShoppingCart);

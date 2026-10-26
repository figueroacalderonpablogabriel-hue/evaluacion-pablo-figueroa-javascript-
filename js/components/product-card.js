class ProductCard extends HTMLElement {
  set product(value) {
    this._product = value;
    this.render();
  }

  render() {
    if (!this._product) return;
    const product = this._product;

    this.innerHTML = `
      <article class="product-card">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(product.price)}</div>
        <span class="stock">${product.stock} disponibles</span>
        <button type="button" data-id="${product.id}">Agregar</button>
      </article>
    `;

    this.querySelector("button").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("add-to-cart", {
        detail: { productId: product.id },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define("product-card", ProductCard);

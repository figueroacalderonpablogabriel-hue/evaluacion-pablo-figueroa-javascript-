class ProductCard extends HTMLElement {
  set product(value) {
    this._product = value;
    this.render();
  }

  render() {
    if (!this._product) return;

    const product = this._product;
    const isAvailable = product.active && product.stock > 0;

    this.innerHTML = `
      <article class="product-card ${isAvailable ? "available" : "disabled"}">
        <div class="card-top">
          <span class="category-pill">${product.category}</span>
          <span class="state-pill ${isAvailable ? "ok" : "blocked"}">
            ${isAvailable ? "Disponible" : "No disponible"}
          </span>
        </div>

        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(product.price)}</div>
        <div class="stock-row">
          <span class="stock">${product.stock} disponibles</span>
        </div>
        <button type="button" data-id="${product.id}" ${isAvailable ? "" : "disabled"}>
          ${isAvailable ? "Agregar" : "Agotado"}
        </button>
      </article>
    `;

    const button = this.querySelector("button");
    if (button) {
      button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("add-to-cart", {
          detail: { productId: product.id },
          bubbles: true,
          composed: true,
        }));
      });
    }
  }
}

customElements.define("product-card", ProductCard);

class ProductList extends HTMLElement {
  set products(value) {
    this._products = Array.isArray(value) ? value : [];
    this.render();
  }

  render() {
    if (!this._products.length) {
      this.innerHTML = '<div class="empty">No hay productos con esos filtros.</div>';
      return;
    }

    this.innerHTML = "";
    this._products.forEach(product => {
      const card = document.createElement("product-card");
      card.product = product;
      this.appendChild(card);
    });
  }
}

customElements.define("product-list", ProductList);

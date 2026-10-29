// product-list.js
// Web Component <product-list>: recibe la lista ya filtrada y crea una <product-card> por producto.

import { crearElemento } from "../utils.js";

class ProductList extends HTMLElement {
  // Los datos llegan con: lista.productos = [ ... ]
  set productos(valor) {
    this._productos = valor;
    this.render();
  }

  render() {
    this.replaceChildren();
    const productos = this._productos || [];

    // Si no hay productos que mostrar, avisamos
    if (productos.length === 0) {
      this.append(crearElemento("p", "No hay productos que coincidan con los filtros.", "mensaje info"));
      return;
    }

    const contenedor = crearElemento("div", "", "grid-productos");
    for (const producto of productos) {
      const tarjeta = document.createElement("product-card");
      tarjeta.producto = producto; // le pasamos el dato a la tarjeta
      contenedor.append(tarjeta);
    }
    this.append(contenedor);
  }
}

customElements.define("product-list", ProductList);

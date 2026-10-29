// product-card.js
// Web Component <product-card>: muestra UN producto y tiene el botón "Agregar".
// No sabe nada de las reglas del carrito: solo avisa con un evento.

import { crearElemento, formatearPesos } from "../utils.js";

class ProductCard extends HTMLElement {
  // El dato llega con: tarjeta.producto = { ... }
  set producto(valor) {
    this._producto = valor;
    this.render();
  }

  get producto() {
    return this._producto;
  }

  // Dibuja la tarjeta
  render() {
    const p = this._producto;
    if (!p) return;

    this.replaceChildren(); // borra lo anterior

    const disponible = p.active && p.stock > 0;

    // Texto del estado (no depende solo del color)
    let estado = "Disponible · " + p.stock + " en stock";
    if (!p.active) estado = "No disponible";
    else if (p.stock === 0) estado = "Agotado";

    const tarjeta = crearElemento("article", "", "tarjeta");
    tarjeta.append(crearElemento("h3", p.name));
    tarjeta.append(crearElemento("p", p.category, "categoria"));
    tarjeta.append(crearElemento("p", p.description));
    tarjeta.append(crearElemento("p", formatearPesos(p.price), "precio"));
    tarjeta.append(crearElemento("p", estado, "estado-producto"));

    const boton = crearElemento("button", "Agregar al carrito");
    boton.type = "button";
    boton.setAttribute("aria-label", "Agregar " + p.name + " al carrito");
    boton.disabled = !disponible; // inactivos o agotados no se pueden agregar
    boton.addEventListener("click", () => this.pedirAgregar());
    tarjeta.append(boton);

    this.append(tarjeta);
  }

  // Emite el evento personalizado. Solo manda el id: el precio NO viaja en el evento.
  pedirAgregar() {
    this.dispatchEvent(new CustomEvent("agregar-producto", {
      detail: { id: this._producto.id },
      bubbles: true,   // sube por el DOM hasta document
      composed: true   // atraviesa un posible Shadow DOM
    }));
  }
}

customElements.define("product-card", ProductCard);

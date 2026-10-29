// shopping-cart.js
// Web Component <shopping-cart>: muestra las líneas del carrito y los importes.
// Solo dibuja y emite eventos. Las reglas (stock, mínimos...) las valida app.js / cart.js.

import { crearElemento, crearBoton, formatearPesos } from "../utils.js";

class ShoppingCart extends HTMLElement {
  // Los datos llegan con: carrito.datos = { lineas, unidades, subtotal, descuento, total }
  set datos(valor) {
    this._datos = valor;
    this.render();
  }

  render() {
    this.replaceChildren();
    const d = this._datos;

    // Carrito vacío
    if (!d || d.lineas.length === 0) {
      this.append(crearElemento("p", "Tu carrito está vacío."));
      this.append(this.crearTotales({ subtotal: 0, descuento: 0, total: 0 }));
      return;
    }

    // Una línea por producto
    const lista = crearElemento("ul", "", "lineas");
    for (const linea of d.lineas) {
      lista.append(this.crearLinea(linea));
    }
    this.append(lista);

    this.append(this.crearTotales(d));

    this.append(crearBoton("Vaciar carrito", "Vaciar todo el carrito", () => {
      this.emitir("vaciar-carrito", {});
    }));
  }

  // Dibuja una línea del carrito
  crearLinea(linea) {
    const item = crearElemento("li", "", "linea");
    item.append(crearElemento("strong", linea.nombre));
    item.append(crearElemento("span", formatearPesos(linea.precio) + " c/u"));

    const controles = crearElemento("div", "", "controles");
    controles.append(crearBoton("−", "Disminuir cantidad de " + linea.nombre, () => {
      this.emitir("cambiar-cantidad", { id: linea.id, cantidad: linea.cantidad - 1 });
    }));
    controles.append(crearElemento("span", "Cantidad: " + linea.cantidad));
    controles.append(crearBoton("+", "Aumentar cantidad de " + linea.nombre, () => {
      this.emitir("cambiar-cantidad", { id: linea.id, cantidad: linea.cantidad + 1 });
    }));
    controles.append(crearBoton("Eliminar", "Eliminar " + linea.nombre + " del carrito", () => {
      this.emitir("eliminar-linea", { id: linea.id });
    }));
    item.append(controles);

    item.append(crearElemento("span", "Subtotal: " + formatearPesos(linea.subtotal)));
    return item;
  }

  // Dibuja subtotal, descuento y total
  crearTotales(d) {
    const caja = crearElemento("div", "", "totales");
    const filas = [
      ["Subtotal", formatearPesos(d.subtotal), ""],
      ["Descuento (10 % desde $300.000)", formatearPesos(d.descuento), ""],
      ["Total", formatearPesos(d.total), "total"]
    ];
    for (const [nombre, valor, clase] of filas) {
      const fila = crearElemento("div", "", clase);
      fila.append(crearElemento("span", nombre));
      fila.append(crearElemento("span", valor));
      caja.append(fila);
    }
    return caja;
  }

  // Emite un evento personalizado hacia arriba
  emitir(nombre, detalle) {
    this.dispatchEvent(new CustomEvent(nombre, {
      detail: detalle,
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define("shopping-cart", ShoppingCart);

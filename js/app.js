// app.js
// Es el "director" de la aplicación: carga el catálogo, aplica filtros,
// escucha los eventos de los componentes, valida con cart.js y actualiza la pantalla.

import { cargarCatalogo } from "./api.js";
import * as carrito from "./cart.js";
import { leerCarrito, guardarCarrito } from "./storage.js";
import { formatearPesos, normalizar, crearElemento } from "./utils.js";

// Importar los componentes hace que se registren (customElements.define)
import "./components/product-card.js";
import "./components/product-list.js";
import "./components/shopping-cart.js";

// ---------- Elementos de la página ----------
const campoBuscar = document.getElementById("buscar");
const campoCategoria = document.getElementById("categoria");
const campoOrden = document.getElementById("orden");
const campoDisponibles = document.getElementById("disponibles");
const gruposFiltros = document.getElementById("campos-filtros");
const botonLimpiar = document.getElementById("btn-limpiar");
const botonReintentar = document.getElementById("btn-reintentar");
const botonConfirmar = document.getElementById("btn-confirmar");
const botonCerrarModal = document.getElementById("btn-cerrar-modal");
const estadoCatalogo = document.getElementById("estado-catalogo");
const zonaMensajes = document.getElementById("mensajes");
const textoUnidades = document.getElementById("unidades");
const listaProductos = document.getElementById("lista-productos");
const componenteCarrito = document.getElementById("carrito");
const modal = document.getElementById("modal-pedido");
const detallePedido = document.getElementById("detalle-pedido");

let catalogo = []; // aquí quedan los productos cargados (no se vuelve a pedir al filtrar)

// ---------- Mensajes ----------

// Mensaje del catálogo: cargando, error o catálogo vacío
function mostrarEstado(texto, tipo) {
  estadoCatalogo.className = "mensaje " + tipo;
  estadoCatalogo.textContent = (tipo === "error" ? "Error: " : "") + texto;
}

function limpiarEstado() {
  estadoCatalogo.className = "mensaje";
  estadoCatalogo.textContent = "";
}

// Mensaje de las operaciones del carrito
function mostrarMensaje(texto, tipo) {
  zonaMensajes.className = "mensaje " + tipo;
  zonaMensajes.textContent = (tipo === "error" ? "Error: " : "Listo: ") + texto;
}

// ---------- Inicio ----------

async function iniciar() {
  botonReintentar.hidden = true;
  gruposFiltros.disabled = true;
  listaProductos.replaceChildren();
  mostrarEstado("Cargando catálogo...", "info");

  // 1. Pedir el catálogo
  try {
    catalogo = await cargarCatalogo();
  } catch (error) {
    catalogo = [];
    carrito.definirCatalogo(catalogo);
    mostrarEstado(error.message, "error");
    botonReintentar.hidden = false;
    pintarCarrito(false); // carrito vacío en pantalla, sin tocar lo guardado
    return;
  }

  // 2. Recuperar el carrito guardado (solo se conservan las líneas válidas)
  carrito.definirCatalogo(catalogo);
  carrito.restaurarLineas(leerCarrito());
  pintarCarrito(true);

  // 3. Catálogo válido pero sin productos
  if (catalogo.length === 0) {
    mostrarEstado("El catálogo se cargó correctamente, pero por ahora no tiene productos.", "info");
    return;
  }

  // 4. Mostrar productos
  limpiarEstado();
  llenarCategorias();
  gruposFiltros.disabled = false;
  aplicarFiltros();
}

// Llena el <select> de categorías con las que existen en el catálogo
function llenarCategorias() {
  campoCategoria.replaceChildren();
  campoCategoria.append(new Option("Todas las categorías", "todas"));

  // Set elimina las categorías repetidas
  const categorias = [...new Set(catalogo.map(function (p) { return p.category; }))];
  for (const categoria of categorias) {
    campoCategoria.append(new Option(categoria, categoria));
  }
}

// ---------- Filtros ----------

// Siempre parte de TODO el catálogo y aplica los 4 controles juntos
function aplicarFiltros() {
  const texto = normalizar(campoBuscar.value.trim());
  const categoria = campoCategoria.value;
  const soloDisponibles = campoDisponibles.checked;
  const orden = campoOrden.value;

  // filter deja solo los productos que cumplen TODAS las condiciones
  const resultado = catalogo.filter(function (p) {
    const coincideTexto = normalizar(p.name).includes(texto) || normalizar(p.description).includes(texto);
    const coincideCategoria = categoria === "todas" || p.category === categoria;
    const coincideDisponible = !soloDisponibles || (p.active && p.stock > 0);
    return coincideTexto && coincideCategoria && coincideDisponible;
  });

  // Ordenar por precio (resultado es una lista nueva, no se daña el catálogo original)
  if (orden === "precio-asc") {
    resultado.sort(function (a, b) { return a.price - b.price; });
  } else if (orden === "precio-desc") {
    resultado.sort(function (a, b) { return b.price - a.price; });
  }

  listaProductos.productos = resultado;
}

function limpiarFiltros() {
  campoBuscar.value = "";
  campoCategoria.value = "todas";
  campoOrden.value = "ninguno";
  campoDisponibles.checked = false;
  aplicarFiltros();
}

// ---------- Carrito en pantalla ----------

// Actualiza el carrito, las unidades del encabezado y (si guardar es true) el localStorage
function pintarCarrito(guardar) {
  const detalle = carrito.calcularDetalle();
  componenteCarrito.datos = detalle;
  textoUnidades.textContent = detalle.unidades;
  botonConfirmar.disabled = detalle.unidades === 0;

  if (guardar) {
    guardarCarrito(carrito.obtenerLineasParaGuardar());
  }
}

// Muestra el mensaje de una operación y refresca el carrito
function responder(resultado) {
  mostrarMensaje(resultado.mensaje, resultado.ok ? "ok" : "error");
  pintarCarrito(true);
}

// ---------- Eventos de los componentes ----------
// Los componentes solo AVISAN. Aquí se decide si la operación es válida (cart.js).

document.addEventListener("agregar-producto", function (evento) {
  responder(carrito.agregarProducto(evento.detail.id));
});

document.addEventListener("cambiar-cantidad", function (evento) {
  responder(carrito.cambiarCantidad(evento.detail.id, evento.detail.cantidad));
});

document.addEventListener("eliminar-linea", function (evento) {
  responder(carrito.eliminarLinea(evento.detail.id));
});

document.addEventListener("vaciar-carrito", function () {
  responder(carrito.vaciarCarrito());
});

// ---------- Confirmar pedido ----------

botonConfirmar.addEventListener("click", function () {
  const resultado = carrito.confirmarPedido();

  if (!resultado.ok) {
    mostrarMensaje(resultado.mensaje, "error");
    pintarCarrito(true);
    return;
  }

  mostrarPedidoEnModal(resultado.pedido);
  mostrarMensaje("Pedido " + resultado.pedido.id + " confirmado (simulación).", "ok");
  pintarCarrito(true); // el carrito ya quedó vacío
});

// Llena el modal con el resumen del pedido
function mostrarPedidoEnModal(pedido) {
  detallePedido.replaceChildren();
  detallePedido.append(crearElemento("p", "Número de pedido: " + pedido.id));

  const lista = crearElemento("ul");
  for (const linea of pedido.detalle.lineas) {
    lista.append(crearElemento("li",
      linea.nombre + " × " + linea.cantidad + " = " + formatearPesos(linea.subtotal)));
  }
  detallePedido.append(lista);

  detallePedido.append(crearElemento("p", "Subtotal: " + formatearPesos(pedido.detalle.subtotal)));
  detallePedido.append(crearElemento("p", "Descuento: " + formatearPesos(pedido.detalle.descuento)));
  detallePedido.append(crearElemento("p", "Total: " + formatearPesos(pedido.detalle.total)));

  modal.showModal();
}

botonCerrarModal.addEventListener("click", function () {
  modal.close();
});

// ---------- Eventos de los filtros ----------
campoBuscar.addEventListener("input", aplicarFiltros);
campoCategoria.addEventListener("change", aplicarFiltros);
campoOrden.addEventListener("change", aplicarFiltros);
campoDisponibles.addEventListener("change", aplicarFiltros);
botonLimpiar.addEventListener("click", limpiarFiltros);
botonReintentar.addEventListener("click", iniciar);

// Evita que Enter en el buscador recargue la página
document.getElementById("filtros").addEventListener("submit", function (e) {
  e.preventDefault();
});

// ¡Arrancamos!
iniciar();

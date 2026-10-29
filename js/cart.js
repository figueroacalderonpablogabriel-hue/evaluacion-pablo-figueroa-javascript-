// cart.js
// Aquí están TODAS las reglas del carrito: agregar, cambiar cantidad, eliminar, vaciar,
// totales, descuento y confirmación del pedido.
// Las funciones devuelven { ok: true/false, mensaje: "..." }.
// Si una operación es inválida, NO se toca el carrito (se conserva el estado anterior).

const UMBRAL_DESCUENTO = 300000; // desde este subtotal hay descuento
const PORCENTAJE_DESCUENTO = 0.10; // 10 %

let catalogo = []; // productos cargados desde el JSON
let lineas = [];   // carrito: lista de { id, cantidad }. Un producto aparece una sola vez.

// ---------- Funciones de apoyo ----------

function resultadoError(mensaje) {
  return { ok: false, mensaje: mensaje };
}

function resultadoOk(mensaje) {
  return { ok: true, mensaje: mensaje };
}

function buscarProducto(id) {
  return catalogo.find(function (p) { return p.id === id; });
}

function buscarLinea(id) {
  return lineas.find(function (l) { return l.id === id; });
}

// Un producto está disponible si está activo y tiene existencias
function estaDisponible(producto) {
  return producto.active && producto.stock > 0;
}

// ---------- Estado del carrito ----------

export function definirCatalogo(lista) {
  catalogo = lista;
}

// Devuelve una copia de las líneas (solo id y cantidad) para guardarlas en localStorage
export function obtenerLineasParaGuardar() {
  return lineas.map(function (l) { return { id: l.id, cantidad: l.cantidad }; });
}

// Recupera un carrito guardado, pero SOLO deja las líneas que siguen siendo válidas
export function restaurarLineas(guardadas) {
  lineas = [];
  for (const { id, cantidad } of guardadas) {
    const producto = buscarProducto(id);

    if (!producto) continue;                       // el producto ya no existe
    if (!estaDisponible(producto)) continue;       // inactivo o agotado
    if (!Number.isInteger(cantidad) || cantidad < 1) continue;  // cantidad inválida
    if (cantidad > producto.stock) continue;       // supera el inventario actual
    if (buscarLinea(id)) continue;                 // id repetido en lo guardado

    lineas.push({ id: id, cantidad: cantidad });
  }
}

// ---------- Operaciones ----------

export function agregarProducto(id) {
  const producto = buscarProducto(id);
  if (!producto) return resultadoError("El producto no existe en el catálogo.");
  if (!producto.active) return resultadoError(producto.name + " no está disponible.");
  if (producto.stock <= 0) return resultadoError(producto.name + " está agotado.");

  const linea = buscarLinea(id);
  const cantidadActual = linea ? linea.cantidad : 0;
  const nuevaCantidad = cantidadActual + 1;

  if (nuevaCantidad > producto.stock) {
    return resultadoError("No hay más unidades de " + producto.name + " (inventario: " + producto.stock + ").");
  }

  // Si ya estaba en el carrito, sumamos 1; si no, creamos la línea
  if (linea) {
    linea.cantidad = nuevaCantidad;
  } else {
    lineas.push({ id: id, cantidad: 1 });
  }
  return resultadoOk(producto.name + " agregado al carrito.");
}

export function cambiarCantidad(id, cantidad) {
  const linea = buscarLinea(id);
  if (!linea) return resultadoError("Ese producto no está en el carrito.");

  const producto = buscarProducto(id);
  if (!producto || !producto.active) return resultadoError("Ese producto ya no está disponible.");

  if (!Number.isInteger(cantidad)) return resultadoError("La cantidad debe ser un número entero.");
  if (cantidad < 1) return resultadoError("La cantidad mínima es 1. Usa el botón Eliminar para quitar el producto.");
  if (cantidad > producto.stock) {
    return resultadoError("No puedes superar el inventario de " + producto.name + " (" + producto.stock + " unidades).");
  }

  linea.cantidad = cantidad;
  return resultadoOk("Cantidad de " + producto.name + " actualizada a " + cantidad + ".");
}

export function eliminarLinea(id) {
  const linea = buscarLinea(id);
  if (!linea) return resultadoError("Ese producto no está en el carrito.");

  lineas = lineas.filter(function (l) { return l.id !== id; });
  return resultadoOk("Producto eliminado del carrito.");
}

export function vaciarCarrito() {
  lineas = [];
  return resultadoOk("El carrito quedó vacío.");
}

// ---------- Cálculos ----------

// Devuelve todo lo que la interfaz necesita mostrar.
// Los precios salen del catálogo, no de lo guardado.
export function calcularDetalle() {
  const detalle = lineas.map(function ({ id, cantidad }) {
    const producto = buscarProducto(id);
    return {
      id: id,
      nombre: producto.name,
      precio: producto.price,
      cantidad: cantidad,
      subtotal: producto.price * cantidad
    };
  });

  const unidades = detalle.reduce(function (suma, l) { return suma + l.cantidad; }, 0);
  const subtotal = detalle.reduce(function (suma, l) { return suma + l.subtotal; }, 0);

  // Descuento del 10 % si el subtotal es igual o mayor a 300.000
  let descuento = 0;
  if (subtotal >= UMBRAL_DESCUENTO) {
    descuento = Math.round(subtotal * PORCENTAJE_DESCUENTO);
  }

  // Si el carrito está vacío, todo da 0 automáticamente
  return {
    lineas: detalle,
    unidades: unidades,
    subtotal: subtotal,
    descuento: descuento,
    total: subtotal - descuento
  };
}

// ---------- Confirmación del pedido ----------

export function confirmarPedido() {
  if (lineas.length === 0) {
    return resultadoError("No puedes confirmar un pedido con el carrito vacío.");
  }

  // Validamos OTRA VEZ cada línea contra el catálogo
  for (const { id, cantidad } of lineas) {
    const producto = buscarProducto(id);
    if (!producto) return resultadoError("Un producto del carrito ya no existe en el catálogo.");
    if (!estaDisponible(producto)) return resultadoError(producto.name + " ya no está disponible.");
    if (!Number.isInteger(cantidad) || cantidad < 1) return resultadoError("Hay una cantidad inválida en " + producto.name + ".");
    if (cantidad > producto.stock) return resultadoError("La cantidad de " + producto.name + " supera el inventario.");
  }

  // Todo está bien: armamos el pedido con un identificador único
  const pedido = {
    id: "PED-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    detalle: calcularDetalle()
  };

  // Solo ahora vaciamos el carrito
  lineas = [];
  return { ok: true, mensaje: "Pedido confirmado.", pedido: pedido };
}

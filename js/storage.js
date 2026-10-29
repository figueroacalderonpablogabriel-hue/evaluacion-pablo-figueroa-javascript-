// storage.js
// Guarda y lee el carrito en localStorage.
// Solo se guarda el id y la cantidad de cada línea. NUNCA el precio:
// el precio siempre se toma del catálogo actual.

const CLAVE = "tecnostock_carrito";

// Guarda las líneas del carrito. Si falla (almacenamiento lleno o bloqueado), la app sigue funcionando.
export function guardarCarrito(lineas) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lineas));
  } catch (error) {
    console.warn("No se pudo guardar el carrito:", error);
  }
}

// Lee las líneas guardadas. Si no hay nada, el JSON está dañado o la estructura no es
// la esperada, devuelve una lista vacía.
export function leerCarrito() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (texto === null) return []; // almacenamiento vacío

    const datos = JSON.parse(texto); // puede lanzar error si el JSON está corrupto
    if (!Array.isArray(datos)) return []; // estructura inesperada

    // Nos quedamos solo con las líneas que tienen id y cantidad enteros
    return datos.filter(function (linea) {
      return typeof linea === "object" && linea !== null &&
             Number.isInteger(linea.id) && Number.isInteger(linea.cantidad);
    });
  } catch (error) {
    return [];
  }
}

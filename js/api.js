// api.js
// Se encarga de pedir el catálogo con fetch() y de VALIDAR que los datos sean correctos.

const URL_CATALOGO = "data/products.json";

// Pide el catálogo. Si algo sale mal, lanza un Error con un mensaje fácil de entender.
export async function cargarCatalogo() {
  // 1. Hacer la solicitud HTTP
  let respuesta;
  try {
    respuesta = await fetch(URL_CATALOGO);
  } catch (error) {
    // fetch falla (se rechaza) cuando no hay conexión o el servidor no responde
    throw new Error("No se pudo conectar para pedir el catálogo. Revisa que el servidor local esté encendido.");
  }

  // 2. Revisar que la respuesta HTTP sea correcta (códigos 200-299)
  if (!respuesta.ok) {
    throw new Error("El servidor respondió con un error HTTP " + respuesta.status + ".");
  }

  // 3. Convertir la respuesta a JSON (puede fallar si el archivo está dañado)
  let datos;
  try {
    datos = await respuesta.json();
  } catch (error) {
    throw new Error("El archivo del catálogo no es un JSON válido.");
  }

  // 4. Validar la estructura y los valores de cada producto
  const problema = validarCatalogo(datos);
  if (problema !== "") {
    throw new Error("Datos inválidos en el catálogo: " + problema);
  }

  // Si todo está bien devolvemos la lista (puede ser una lista vacía y es válido)
  return datos;
}

// Revisa la lista de productos.
// Devuelve un texto con el problema encontrado, o "" si todo está bien.
export function validarCatalogo(datos) {
  // Debe ser una lista (array)
  if (!Array.isArray(datos)) {
    return "se esperaba una lista de productos.";
  }

  // Aquí guardamos los ids que ya vimos para detectar repetidos
  const idsVistos = new Set();

  for (const producto of datos) {
    // Cada elemento debe ser un objeto
    if (typeof producto !== "object" || producto === null) {
      return "hay un elemento que no es un producto.";
    }

    // Desestructuración: sacamos cada propiedad en su propia variable
    const { id, name, category, price, stock, description, active } = producto;

    // id: entero positivo y único
    if (!Number.isInteger(id) || id <= 0) {
      return "hay un producto con id inválido.";
    }
    if (idsVistos.has(id)) {
      return "el id " + id + " está repetido.";
    }
    idsVistos.add(id);

    // Textos obligatorios
    if (typeof name !== "string" || name.trim() === "") {
      return "el producto " + id + " no tiene nombre válido.";
    }
    if (typeof category !== "string" || category.trim() === "") {
      return "el producto " + id + " no tiene categoría válida.";
    }
    if (typeof description !== "string") {
      return "el producto " + id + " no tiene descripción válida.";
    }

    // Precio: número finito y mayor que 0 (no acepta negativos ni cero)
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return "el producto " + id + " tiene un precio inválido.";
    }

    // Stock: entero mayor o igual a 0 (no acepta negativos)
    if (!Number.isInteger(stock) || stock < 0) {
      return "el producto " + id + " tiene un inventario inválido.";
    }

    // active: debe ser true o false
    if (typeof active !== "boolean") {
      return "el producto " + id + " tiene un estado de disponibilidad inválido.";
    }
  }

  return "";
}

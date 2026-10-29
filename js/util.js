// utils.js
// Funciones pequeñas que se reutilizan en varios archivos.

// Convierte un número a pesos colombianos. Ej: 189900 -> "$ 189.900"
export function formatearPesos(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor);
}

// Pasa el texto a minúsculas y le quita las tildes.
// Así "Teclado", "teclado" y "TÉCLADO" se consideran iguales al buscar.
export function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Crea un elemento HTML con texto y (opcionalmente) una clase CSS.
// Usamos textContent (no innerHTML) para que el texto nunca se interprete como código.
export function crearElemento(etiqueta, texto = "", clase = "") {
  const elemento = document.createElement(etiqueta);
  elemento.textContent = texto;
  if (clase) elemento.className = clase;
  return elemento;
}

// Crea un botón con su texto, una etiqueta para lectores de pantalla y la función del clic.
export function crearBoton(texto, etiquetaAria, alHacerClic) {
  const boton = crearElemento("button", texto);
  boton.type = "button";
  boton.setAttribute("aria-label", etiquetaAria);
  boton.addEventListener("click", alHacerClic);
  return boton;
}

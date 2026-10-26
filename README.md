# TecnoStock

Aplicación web de comercio electrónico para la venta de productos tecnológicos. El proyecto permite ver un catálogo, buscar artículos, filtrar por categoría, ordenar por precio y gestionar un carrito de compras con descuento y confirmación de pedido.

## Descripción

TecnoStock es una tienda virtual de tecnología construida con HTML, CSS y JavaScript puro. La información del catálogo se carga desde un archivo JSON y el estado del carrito se guarda en `localStorage`, lo que permite mantener la compra aunque se recargue la página.

## Funcionalidades

- Catálogo de productos con nombre, descripción, precio y stock.
- Búsqueda por texto.
- Filtro por categoría.
- Ordenamiento por precio.
- Agregar productos al carrito.
- Modificar cantidades en el carrito.
- Eliminar productos o vaciar el carrito completo.
- Cálculo de subtotal, descuento y total del pedido.
- Confirmación de compra con código generado automáticamente.
- Persistencia del carrito con `localStorage`.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript ES Modules
- JSON para el catálogo de productos
- Navegador moderno

## Estructura del proyecto

```text
.
├── css/
│   └── style.css
├── data/
│   └── products.json
├── js/
│   ├── api.js
│   ├── app.js
│   ├── cart.js
│   └── storage.js
├── index.html
├── README.md
└── .gitignore
```

## Requisitos

- Un navegador web moderno (Chrome, Edge, Firefox o Safari).
- Opcionalmente, un servidor local para ejecutar la aplicación de forma más realista.

## Cómo ejecutar el proyecto

### Opción 1: Abrir directamente

1. Clona o descarga el repositorio.
2. Abre el archivo `index.html` en tu navegador.

### Opción 2: Servidor local

Desde la raíz del proyecto, ejecuta:

```bash
python -m http.server 8000
```

Luego abre en el navegador la siguiente dirección:

```text
http://localhost:8000
```

## Datos del catálogo

Los productos se encuentran en:

- `data/products.json`

Cada producto incluye campos como:

- `id`
- `name`
- `category`
- `price`
- `stock`
- `description`
- `active`

## Lógica de negocio

- El subtotal se calcula a partir de los productos agregados al carrito.
- Si el subtotal es mayor o igual a $300.000, se aplica un descuento del 10%.
- No se permiten productos sin stock o inactivos.
- La cantidad elegida de cada producto no puede superar el stock disponible.

## Autor

Proyecto desarrollado para evaluación de JavaScript.

## Licencia

Este proyecto no especifica una licencia explícita por el momento.

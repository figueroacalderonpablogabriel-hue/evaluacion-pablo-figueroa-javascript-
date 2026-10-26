import "./components/product-card.js";
import "./components/product-list.js";
import "./components/shopping-cart.js";

import { fetchProducts } from "./api.js";
import { Cart, normalizeCartFromStorage, saveCartToStorage } from "./cart.js";

const productList = document.querySelector("#productList");
const shoppingCart = document.querySelector("#shoppingCart");
const cartBadge = document.querySelector("#cartBadge");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const sortBy = document.querySelector("#sortBy");
const availableOnly = document.querySelector("#availableOnly");
const clearFiltersBtn = document.querySelector("#clearFiltersBtn");
const statusMessage = document.querySelector("#statusMessage");
const subtotalValue = document.querySelector("#subtotalValue");
const discountValue = document.querySelector("#discountValue");
const totalValue = document.querySelector("#totalValue");
const orderDetails = document.querySelector("#orderDetails");
const confirmOrderBtn = document.querySelector("#confirmOrderBtn");
const toast = document.querySelector("#toast");

let catalog = [];
let cart = new Cart();
let filters = {
  query: "",
  category: "all",
  availableOnly: false,
  sortBy: "none",
};

function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function showStatus(message, type = "info") {
  if (!message) {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
    statusMessage.classList.remove("visible");
    return;
  }

  statusMessage.textContent = message;
  statusMessage.className = `status-message visible ${type}`;
}

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  toast.dataset.type = type;

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function isValidProduct(product) {
  if (!product || typeof product !== "object") return false;
  const id = Number(product.id);
  const price = Number(product.price);
  const stock = Number(product.stock);

  return (
    Number.isInteger(id) &&
    id > 0 &&
    Number.isFinite(price) &&
    price > 0 &&
    Number.isFinite(stock) &&
    Number.isInteger(stock) &&
    stock >= 0 &&
    typeof product.name === "string" &&
    product.name.trim() &&
    typeof product.description === "string" &&
    typeof product.category === "string" &&
    product.category.trim() &&
    typeof product.active === "boolean"
  );
}

function validateCatalog(data) {
  if (!Array.isArray(data)) {
    throw new Error("La respuesta del catálogo no tiene el formato esperado.");
  }

  if (data.length === 0) {
    return [];
  }

  const validProducts = data.filter(isValidProduct);
  if (validProducts.length !== data.length) {
    throw new Error("Uno o más productos del catálogo son inválidos.");
  }

  return validProducts;
}

function renderCategories() {
  const categories = [...new Set(catalog.map((product) => product.category))].sort();
  const currentValue = categoryFilter.value || "all";
  categoryFilter.innerHTML = '<option value="all">Todas</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === currentValue) option.selected = true;
    categoryFilter.appendChild(option);
  });

  if (!categories.includes(currentValue) && currentValue !== "all") {
    categoryFilter.value = "all";
    filters.category = "all";
  }
}

function getFilteredProducts() {
  const query = filters.query.trim().toLowerCase();
  let result = [...catalog];

  if (query) {
    result = result.filter((product) => {
      const searchText = `${product.name} ${product.description}`.toLowerCase();
      return searchText.includes(query);
    });
  }

  if (filters.category !== "all") {
    result = result.filter((product) => product.category === filters.category);
  }

  if (filters.availableOnly) {
    result = result.filter((product) => product.active && product.stock > 0);
  }

  if (filters.sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

function renderProducts() {
  if (!catalog.length) {
    productList.products = [];
    return;
  }

  const filteredProducts = getFilteredProducts();
  productList.products = filteredProducts;
}

function updateCartSummary() {
  const totalUnits = cart.totalUnits;
  cartBadge.textContent = `${totalUnits} unidad${totalUnits === 1 ? "" : "es"}`;

  const summary = cart.getSummary(catalog);
  subtotalValue.textContent = formatCOP(summary.subtotal);
  discountValue.textContent = formatCOP(summary.discount);
  totalValue.textContent = formatCOP(summary.total);
  confirmOrderBtn.disabled = cart.items.length === 0;
}

function renderCart() {
  globalThis.__TECNO_STOCK_CATALOG__ = catalog;
  shoppingCart.cart = cart;
  shoppingCart.catalog = catalog;
  updateCartSummary();
}

function persistCart() {
  saveCartToStorage(cart);
}

function applyStoredCart() {
  const stored = normalizeCartFromStorage({ items: JSON.parse(localStorage.getItem("tecnostock.cart") || "{}")?.items || [] }, catalog);
  if (stored.length) {
    cart = new Cart(stored);
    renderCart();
  }
}

function loadCatalog() {
  showStatus("Cargando catálogo...", "loading");

  fetchProducts()
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("La respuesta del catálogo no tiene el formato esperado.");
      }

      if (data.length === 0) {
        catalog = [];
        productList.products = [];
        showStatus("El catálogo está vacío. No hay productos disponibles.", "info");
        renderCategories();
        renderCart();
        return;
      }

      catalog = validateCatalog(data);
      globalThis.__TECNO_STOCK_CATALOG__ = catalog;
      renderCategories();
      renderProducts();
      showStatus("", "info");

      try {
        const stored = JSON.parse(localStorage.getItem("tecnostock.cart") || "null");
        const validCart = normalizeCartFromStorage(stored || { items: [] }, catalog);
        cart = new Cart(validCart);
      } catch (error) {
        cart = new Cart();
      }

      renderCart();
    })
    .catch((error) => {
      catalog = [];
      productList.products = [];
      renderCategories();
      renderCart();
      showStatus(error.message || "No se pudo cargar el catálogo.", "error");
    });
}

function addToCart(productId) {
  const product = catalog.find((item) => item.id === productId);
  if (!product) {
    showToast("Producto no encontrado en el catálogo.", "error");
    return;
  }

  try {
    cart.addProduct(product, 1);
    persistCart();
    renderCart();
    showToast("Producto agregado al carrito.", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

function handleCartAction(event) {
  const { action, productId } = event.detail;

  try {
    if (action === "increase") {
      cart.increase(productId);
    } else if (action === "decrease") {
      cart.decrease(productId);
    } else if (action === "remove") {
      cart.removeProduct(productId);
    }

    persistCart();
    renderCart();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function confirmOrder() {
  if (!cart.items.length) {
    showToast("El carrito está vacío. Agrega productos antes de confirmar.", "error");
    return;
  }

  const invalidItems = cart.items.filter((item) => {
    const product = catalog.find((entry) => entry.id === item.id);
    return !product || !product.active || item.qty > product.stock || item.qty < 1;
  });

  if (invalidItems.length) {
    showToast("Hay productos inválidos o sin stock disponible. Corrige el carrito antes de continuar.", "error");
    return;
  }

  const summary = cart.getSummary(catalog);
  const orderId = `TS-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

  const lines = cart.items
    .map((item) => {
      const product = catalog.find((entry) => entry.id === item.id);
      return `${product.name} x ${item.qty} - ${formatCOP(product.price * item.qty)}`;
    })
    .join(" | ");

  orderDetails.innerHTML = `
    <strong>Pedido ${orderId}</strong><br>
    <span>${lines}</span><br>
    <span>Subtotal: ${formatCOP(summary.subtotal)}</span><br>
    <span>Descuento: ${formatCOP(summary.discount)}</span><br>
    <span>Total: ${formatCOP(summary.total)}</span>
  `;

  cart.clear();
  persistCart();
  renderCart();
  showToast(`Pedido ${orderId} confirmado correctamente.`, "success");
}

function bindEvents() {
  productList.addEventListener("add-to-cart", (event) => {
    addToCart(event.detail.productId);
  });

  shoppingCart.addEventListener("cart-action", handleCartAction);
  searchInput.addEventListener("input", (event) => {
    filters.query = event.target.value;
    renderProducts();
  });

  categoryFilter.addEventListener("change", (event) => {
    filters.category = event.target.value;
    renderProducts();
  });

  sortBy.addEventListener("change", (event) => {
    filters.sortBy = event.target.value;
    renderProducts();
  });

  availableOnly.addEventListener("change", (event) => {
    filters.availableOnly = event.target.checked;
    renderProducts();
  });

  clearFiltersBtn.addEventListener("click", () => {
    filters = { query: "", category: "all", availableOnly: false, sortBy: "none" };
    searchInput.value = "";
    categoryFilter.value = "all";
    sortBy.value = "none";
    availableOnly.checked = false;
    renderProducts();
  });

  confirmOrderBtn.addEventListener("click", confirmOrder);
}

bindEvents();
loadCatalog();

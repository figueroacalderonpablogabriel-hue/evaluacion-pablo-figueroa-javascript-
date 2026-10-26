import { fetchProducts, formatCurrency } from "./api.js";
import { Cart } from "./cart.js";
import { saveCart, loadCart } from "./storage.js";
import "./components/product-card.js";
import "./components/product-list.js";
import "./components/shopping-cart.js";

const state = {
  products: [],
  cart: new Cart(),
  filters: { search: "", category: "all", sort: "featured" }
};

const productList = document.getElementById("product-list");
const shoppingCart = document.getElementById("shopping-cart");
const cartCount = document.getElementById("cart-count");
const categorySelect = document.getElementById("category");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const clearFiltersBtn = document.getElementById("clearFilters");
const statusEl = document.getElementById("status");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const toast = document.getElementById("toast");
const confirmBtn = document.getElementById("confirmOrder");

init();

async function init() {
  try {
    const products = await fetchProducts();
    state.products = products;
    fillCategories();
    state.cart = new Cart(loadCart());
    bindEvents();
    renderProducts();
    renderCart();
    updateSummary();
    statusEl.textContent = `Mostrando ${products.length} productos.`;
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

function bindEvents() {
  searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  categorySelect.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderProducts();
  });

  sortSelect.addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    renderProducts();
  });

  clearFiltersBtn.addEventListener("click", () => {
    state.filters = { search: "", category: "all", sort: "featured" };
    searchInput.value = "";
    categorySelect.value = "all";
    sortSelect.value = "featured";
    renderProducts();
  });

  productList.addEventListener("add-to-cart", (event) => {
    const productId = Number(event.detail.productId);
    const product = state.products.find(item => item.id === productId);
    if (!product) return;

    try {
      state.cart.add(product);
      saveCart(state.cart);
      renderCart();
      updateSummary();
      showToast(`${product.name} agregado al carrito.`);
    } catch (error) {
      showToast(error.message);
    }
  });

  shoppingCart.addEventListener("cart-action", (event) => {
    const { action, productId } = event.detail;
    const product = state.products.find(item => item.id === productId);
    if (!product) return;

    if (action === "increase") {
      try {
        state.cart.add(product);
      } catch (error) {
        showToast(error.message);
      }
    }

    if (action === "decrease") {
      state.cart.update(productId, -1);
    }

    if (action === "remove") {
      state.cart.remove(productId);
    }

    saveCart(state.cart);
    renderCart();
    updateSummary();
  });

  confirmBtn.addEventListener("click", () => {
    if (state.cart.items.length === 0) {
      showToast("El carrito está vacío.");
      return;
    }

    const summary = state.cart.getSummary(state.products);
    const orderId = `PED-${Date.now()}`;
    showToast(`Pedido ${orderId} confirmado.`);
    state.cart.clear();
    saveCart(state.cart);
    renderCart();
    updateSummary();
  });
}

function fillCategories() {
  const categories = [...new Set(state.products.map(p => p.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function getFilteredProducts() {
  let filtered = [...state.products];

  if (state.filters.search) {
    filtered = filtered.filter(product => {
      const text = `${product.name} ${product.description}`.toLowerCase();
      return text.includes(state.filters.search);
    });
  }

  if (state.filters.category !== "all") {
    filtered = filtered.filter(product => product.category === state.filters.category);
  }

  if (state.filters.sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (state.filters.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);

  return filtered;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  productList.products = filtered;
  statusEl.textContent = filtered.length ? `Mostrando ${filtered.length} productos.` : "Sin resultados.";
}

function renderCart() {
  const totalUnits = state.cart.getTotalUnits();
  cartCount.textContent = `Carrito: ${totalUnits}`;
  shoppingCart.cart = state.cart;
  shoppingCart.catalog = state.products;
}

function updateSummary() {
  const summary = state.cart.getSummary(state.products);
  subtotalEl.textContent = formatCurrency(summary.subtotal);
  discountEl.textContent = formatCurrency(summary.discount);
  totalEl.textContent = formatCurrency(summary.total);
  cartCount.textContent = `Carrito: ${state.cart.getTotalUnits()}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

import { fetchProducts, formatCurrency } from "./api.js";
import { Cart } from "./cart.js";
import { saveCart, loadCart } from "./storage.js";
import "./components/product-card.js";
import "./components/product-list.js";
import "./components/shopping-cart.js";

const state = {
  products: [],
  cart: new Cart(),
  filters: { search: "", category: "all", sort: "featured", availableOnly: false }
};

const productList = document.getElementById("product-list");
const shoppingCart = document.getElementById("shopping-cart");
const cartCount = document.getElementById("cart-count");
const categorySelect = document.getElementById("category");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const availableOnlyInput = document.getElementById("availableOnly");
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

    const storedItems = loadCart();
    const validStoredItems = storedItems.filter((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return product && product.active && item.qty <= product.stock && item.qty > 0;
    });

    state.cart = new Cart(validStoredItems);
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

  availableOnlyInput.addEventListener("change", (event) => {
    state.filters.availableOnly = event.target.checked;
    renderProducts();
  });

  clearFiltersBtn.addEventListener("click", () => {
    state.filters = { search: "", category: "all", sort: "featured", availableOnly: false };
    searchInput.value = "";
    categorySelect.value = "all";
    sortSelect.value = "featured";
    availableOnlyInput.checked = false;
    renderProducts();
  });

  productList.addEventListener("add-to-cart", (event) => {
    const productId = Number(event.detail.productId);
    const product = state.products.find((item) => item.id === productId);
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
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;

    try {
      if (action === "increase") {
        const currentItem = state.cart.items.find((item) => item.id === productId);
        const nextQty = (currentItem ? currentItem.qty : 0) + 1;

        if (!product.active || product.stock <= 0) {
          throw new Error("Producto no disponible.");
        }

        if (nextQty > product.stock) {
          throw new Error("No hay suficiente stock.");
        }

        state.cart.add(product);
      }

      if (action === "decrease") {
        const currentItem = state.cart.items.find((item) => item.id === productId);
        if (!currentItem) return;

        if (currentItem.qty <= 1) {
          state.cart.remove(productId);
        } else {
          state.cart.update(productId, -1);
        }
      }

      if (action === "remove") {
        state.cart.remove(productId);
      }

      saveCart(state.cart);
      renderCart();
      updateSummary();
    } catch (error) {
      showToast(error.message);
    }
  });

  confirmBtn.addEventListener("click", () => {
    if (state.cart.items.length === 0) {
      showToast("El carrito está vacío.");
      return;
    }

    const invalidItems = state.cart.items.filter((item) => {
      const product = state.products.find((entry) => entry.id === item.id);
      return !product || !product.active || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > product.stock;
    });

    if (invalidItems.length > 0) {
      showToast("El pedido no puede confirmarse porque hay productos inválidos o sin stock suficiente.");
      return;
    }

    const summary = state.cart.getSummary(state.products);
    const orderId = `PED-${Date.now()}`;
    showToast(`Pedido ${orderId} confirmado. Subtotal: ${formatCurrency(summary.subtotal)}.`);
    state.cart.clear();
    saveCart(state.cart);
    renderCart();
    updateSummary();
  });
}

function fillCategories() {
  const categories = [...new Set(state.products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function getFilteredProducts() {
  let filtered = [...state.products];

  if (state.filters.search) {
    filtered = filtered.filter((product) => {
      const text = `${product.name} ${product.description}`.toLowerCase();
      return text.includes(state.filters.search);
    });
  }

  if (state.filters.category !== "all") {
    filtered = filtered.filter((product) => product.category === state.filters.category);
  }

  if (state.filters.availableOnly) {
    filtered = filtered.filter((product) => product.active && product.stock > 0);
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

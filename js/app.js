import { fetchProducts, formatCurrency } from "./api.js";
import { Cart } from "./cart.js";
import { saveCart, loadCart } from "./storage.js";

const state = {
  products: [],
  cart: new Cart(),
  filters: {
    search: "",
    category: "all",
    sort: "featured"
  }
};

const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");
const clearFiltersBtn = document.getElementById("clearFilters");
const statusEl = document.getElementById("status");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const confirmBtn = document.getElementById("confirmOrder");
const toast = document.getElementById("toast");

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
  searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value.trim().toLowerCase();
    renderProducts();
  });

  categorySelect.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    renderProducts();
  });

  sortSelect.addEventListener("change", (e) => {
    state.filters.sort = e.target.value;
    renderProducts();
  });

  clearFiltersBtn.addEventListener("click", () => {
    state.filters = { search: "", category: "all", sort: "featured" };
    searchInput.value = "";
    categorySelect.value = "all";
    sortSelect.value = "featured";
    renderProducts();
  });

  confirmBtn.addEventListener("click", () => {
    if (state.cart.items.length === 0) {
      showToast("El carrito está vacío.");
      return;
    }

    const summary = state.cart.getSummary(state.products);
    const orderId = `PED-${Date.now()}`;

    showToast(`Pedido ${orderId} confirmado correctamente.`);
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

  if (state.filters.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.filters.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
}

function renderProducts() {
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    productList.innerHTML = '<div class="empty">No hay productos con esos filtros.</div>';
    statusEl.textContent = "Sin resultados.";
    return;
  }

  statusEl.textContent = `Mostrando ${filtered.length} productos.`;

  productList.innerHTML = filtered.map(product => `
    <article class="product-card">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price">${formatCurrency(product.price)}</div>
      <span class="stock">${product.stock} disponibles</span>
      <button data-id="${product.id}">Agregar</button>
    </article>
  `).join("");

  productList.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const product = state.products.find(p => p.id === id);

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
  });
}

function renderCart() {
  if (state.cart.items.length === 0) {
    cartItems.innerHTML = '<li class="empty">Tu carrito está vacío.</li>';
    cartCount.textContent = "Carrito: 0";
    return;
  }

  const map = new Map(state.products.map(p => [p.id, p]));

  cartItems.innerHTML = state.cart.items.map(item => {
    const product = map.get(item.id);
    if (!product) return "";

    return `
      <li>
        <div>
          <strong>${product.name}</strong><br>
          <small>${formatCurrency(product.price)} c/u</small>
        </div>

        <div class="cart-actions">
          <button data-action="decrease" data-id="${product.id}">-</button>
          <span>${item.qty}</span>
          <button data-action="increase" data-id="${product.id}">+</button>
          <button data-action="remove" data-id="${product.id}">X</button>
        </div>
      </li>
    `;
  }).join("");

  cartItems.querySelectorAll("button").forEach(button => {
    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    button.addEventListener("click", () => {
      const product = state.products.find(p => p.id === id);
      if (!product) return;

      if (action === "increase") {
        try {
          state.cart.add(product);
          showToast("Aumentaste la cantidad.");
        } catch (error) {
          showToast(error.message);
        }
      }

      if (action === "decrease") {
        state.cart.update(id, -1);
        showToast("Cantidad reducida.");
      }

      if (action === "remove") {
        state.cart.remove(id);
        showToast("Producto eliminado.");
      }

      saveCart(state.cart);
      renderCart();
      updateSummary();
    });
  });

  cartCount.textContent = `Carrito: ${state.cart.getTotalUnits()}`;
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
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}